mod utils;
use actix_web::{post, App, HttpResponse, HttpServer, Responder};
use std::{process::Command, str::FromStr};
use toml_edit::{value, Document};

use execute::Execute;
use fuels::{
    signers::fuel_crypto::rand::{distributions::Alphanumeric, thread_rng, Rng},
    types::{Address, AssetId},
};

const DIR_PATH: &str = "/Users/alexey/projects/fuel/limit_orders/services/predicate-orders-builder";

#[post("/create")]
async fn create_order_post(req_body_str: String) -> impl Responder {
    let req_body: serde_json::Value = serde_json::from_str(&req_body_str).unwrap();
    let req_body = req_body.as_object().unwrap().clone();

    let asset0 = req_body["asset0"].as_str().unwrap();
    let amount0 = req_body["amount0"].as_u64().unwrap();
    let asset1 = req_body["asset1"].as_str().unwrap();
    let amount1 = req_body["amount1"].as_u64().unwrap();
    let owner = req_body["owner"].as_str().unwrap();

    if AssetId::from_str(asset0).is_err()
        || AssetId::from_str(asset1).is_err()
        || Address::from_str(owner).is_err()
    {
        return HttpResponse::BadRequest().body("Bad Request");
    }

    let forc_path = &format!("{DIR_PATH}/forc");
    let mut first_command = Command::new(forc_path);

    let rand_string: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(30)
        .map(char::from)
        .collect();

    let path = format!("{DIR_PATH}/order-template");
    let output_directory = format!("{DIR_PATH}/orders/{rand_string}");
    utils::copy_recursively(path.clone(), output_directory.clone()).unwrap();
    let forc_toml_path = format!("{output_directory}/Forc.toml");
    let forc_toml = std::fs::read_to_string(&forc_toml_path).expect("Cannom fimd Forc.toml");
    let mut forc_toml = forc_toml.parse::<Document>().expect("invalid forc_toml");
    forc_toml["constants"]["ASSET_0"]["type"] = value("Identity");
    forc_toml["constants"]["ASSET_0"]["value"] = value(asset0);

    forc_toml["constants"]["AMOUNT_0"]["type"] = value("u64");
    forc_toml["constants"]["AMOUNT_0"]["value"] = value(amount0.to_string());

    forc_toml["constants"]["ASSET_1"]["type"] = value("Identity");
    forc_toml["constants"]["ASSET_1"]["value"] = value(asset1);

    forc_toml["constants"]["AMOUNT_1"]["type"] = value("u64");
    forc_toml["constants"]["AMOUNT_1"]["value"] = value(amount1.to_string());

    forc_toml["constants"]["ORDER_OWNER"]["type"] = value("Identity");
    forc_toml["constants"]["ORDER_OWNER"]["value"] = value(owner);

    std::fs::write(forc_toml_path, forc_toml.to_string()).unwrap();
    let output_directory = format!("{output_directory}/out");

    first_command.arg("build");
    first_command.arg("--path");
    first_command.arg(path);
    first_command.arg("--output-directory");
    first_command.arg(output_directory);

    if first_command.execute_check_exit_status_code(0).is_err() {
        let msg = format!(
            "The path `{}` is not a correct FFmpeg executable binary file. {}",
            forc_path,
            first_command
                .execute_check_exit_status_code(0)
                .err()
                .unwrap()
        );
        eprintln!("{}", msg);
        HttpResponse::BadRequest().body(msg)
    } else {
        if let Some(exit_code) = first_command.execute().unwrap() {
            if exit_code == 0 {
                HttpResponse::Ok().body(rand_string)
            } else {
                eprintln!("Failed. with code {exit_code}");
                HttpResponse::BadRequest().body("Failed.")
            }
        } else {
            eprintln!("Interrupted!");
            HttpResponse::BadRequest().body("Interrupted!")
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().service(create_order_post)
        // .route("/create", web::get().to(create_order))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
