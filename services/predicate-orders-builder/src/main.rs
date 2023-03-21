mod utils;
use actix_web::{post, App, HttpResponse, HttpServer, Responder};
use utils::print_title;
use std::{process::Command, str::FromStr};
use toml_edit::{value, Document};

use execute::Execute;
use fuels::{
    signers::fuel_crypto::rand::{distributions::Alphanumeric, thread_rng, Rng},
    types::{Address, AssetId},
};

use crate::utils::get_file_as_byte_vec;

const DIR_PATH: &str = "/Users/alexey/projects/fuel/limit_orders/services/predicate-orders-builder";

// TODO: Add token id into responce and add return code by id
// struct ResponseData {
//     code: Vec<u8>,
//     id: String,
// }

#[post("/create")]
async fn create_order_post(req_body_str: String) -> impl Responder {
    let req_body: serde_json::Value = serde_json::from_str(&req_body_str).unwrap();
    let req_body = req_body.as_object().unwrap().clone();

    let asset0 = req_body["asset0"].as_str().unwrap();
    let amount0 = req_body["amount0"].as_str().unwrap();
    let asset1 = req_body["asset1"].as_str().unwrap();
    let amount1 = req_body["amount1"].as_str().unwrap();
    let owner = req_body["owner"].as_str().unwrap();

    if AssetId::from_str(asset1).is_err()
        || Address::from_str(owner).is_err()
        || amount1.parse::<u64>().is_err()
        || amount0.parse::<u64>().is_err()
        || AssetId::from_str(asset0).is_err()
    {
        return HttpResponse::BadRequest().body("Bad Request");
    }

    let rand_string: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(30)
        .map(char::from)
        .collect();

    let template_path = format!("{DIR_PATH}/order-template");
    let order_directory = format!("{DIR_PATH}/orders/{rand_string}");
    
    utils::copy_recursively(template_path, order_directory.clone()).unwrap();
    
    let forc_toml_path = format!("{order_directory}/Forc.toml");
    let forc_toml = std::fs::read_to_string(&forc_toml_path).expect("Cannom fimd Forc.toml");
    let mut forc_toml = forc_toml.parse::<Document>().expect("invalid forc_toml");

    forc_toml["constants"]["ASK_TOKEN_CONFIG"]["type"] = value("b256");
    forc_toml["constants"]["ASK_TOKEN_CONFIG"]["value"] = value(asset1);

    forc_toml["constants"]["ASK_AMOUNT"]["type"] = value("u64");
    forc_toml["constants"]["ASK_AMOUNT"]["value"] = value(amount1);

    forc_toml["constants"]["RECEIVER_CONFIG"]["type"] = value("b256");
    forc_toml["constants"]["RECEIVER_CONFIG"]["value"] = value(owner);

    std::fs::write(forc_toml_path, forc_toml.to_string()).unwrap();
    let output_directory = format!("{order_directory}/out");

    let forc_path = format!("{DIR_PATH}/forc");
    let mut first_command = Command::new(&forc_path);
    first_command.arg("build");
    first_command.arg("--path");
    first_command.arg(order_directory);
    first_command.arg("--output-directory");
    first_command.arg(output_directory.clone());

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
                let path = format!("{output_directory}/swap-predicate.bin");
                let code = get_file_as_byte_vec(&path);
                // let data = ResponseData {
                //     id: rand_string,
                //     code: get_file_as_byte_vec(&path),
                // };
                // HttpResponse::Ok().body(serde_json::to_string::<ResponseData>(&data).unwrap())
                let serialized_data = serde_json::to_string(&code).unwrap();
                HttpResponse::Ok().json(serialized_data)
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
    print_title("✅ Backend is alive");
    HttpServer::new(|| {
        App::new().service(create_order_post)
        // .route("/get_code", web::get().to(get_code))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
