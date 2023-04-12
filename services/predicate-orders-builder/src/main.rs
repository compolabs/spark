mod utils;
use actix_web::{post, web, App, HttpServer};
use rand::{distributions::Alphanumeric, thread_rng, Rng};
use std::process::Command;
use utils::print_title;

use execute::Execute;

use crate::utils::get_file_as_byte_vec;
use serde::Serialize;

const DIR_PATH: &str = "/Users/alexey/projects/fuel/limit_orders/services/predicate-orders-builder";

#[derive(Serialize)]
pub struct ResponseData {
    code: String,
    id: String,
}

impl ResponseData {
    fn default() -> Self {
        ResponseData {
            code: "".to_string(),
            id: "".to_string(),
        }
    }
}

#[post("/create")]
async fn create_order_post(req_body_str: String) -> web::Json<ResponseData> {
    let req_body: serde_json::Value = serde_json::from_str(&req_body_str).unwrap();
    let req_body = req_body.as_object().unwrap().clone();

    let asset0 = req_body["asset0"].as_str().unwrap();
    let amount0 = req_body["amount0"].as_str().unwrap();
    let asset1 = req_body["asset1"].as_str().unwrap();
    let amount1 = req_body["amount1"].as_str().unwrap();
    let owner = req_body["owner"].as_str().unwrap();

    //TODO ADD VALIDATION
    // if AssetId::from_str(asset1).is_err()
    //     || Address::from_str(owner).is_err()
    //     || amount1.parse::<u64>().is_err()
    //     || amount0.parse::<u64>().is_err()
    //     || AssetId::from_str(asset0).is_err()
    // {
    //     return web::Json(ResponseData::default());
    // }

    let id: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(30)
        .map(char::from)
        .collect();

    let template_path = format!("{DIR_PATH}/order-template");
    let order_directory = format!("{DIR_PATH}/orders/{id}");

    utils::copy_recursively(template_path, order_directory.clone()).unwrap();

    // let forc_toml_path = format!("{order_directory}/Forc.toml");
    // let forc_toml = std::fs::read_to_string(&forc_toml_path).expect("Cannom fimd Forc.toml");
    // let mut forc_toml = forc_toml.parse::<Document>().expect("invalid forc_toml");

    // //FIXME these constants will be deprecated, check out new 'configurable' block (just like 'storage' in contracts)
    // forc_toml["constants"]["ASK_TOKEN_CONFIG"]["type"] = value("b256");
    // forc_toml["constants"]["ASK_TOKEN_CONFIG"]["value"] = value(asset1);

    // forc_toml["constants"]["ASK_AMOUNT"]["type"] = value("u64");
    // forc_toml["constants"]["ASK_AMOUNT"]["value"] = value(amount1);

    // forc_toml["constants"]["RECEIVER_CONFIG"]["type"] = value("b256");
    // forc_toml["constants"]["RECEIVER_CONFIG"]["value"] = value(owner);

    // std::fs::write(forc_toml_path, forc_toml.to_string()).unwrap();
    let predicate_code_path = format!("{order_directory}/src/main.sw");
    let predicate_code = std::fs::read_to_string(&predicate_code_path)
        .expect("Cannom fimd main.sw")
        .replace("<AMOUNT0>", amount0)
        .replace("<ASSET0>", asset0)
        .replace("<AMOUNT1>", amount1)
        .replace("<ASSET1>", asset1)
        .replace("<OWNER>", owner)
        .replace("<ORDER_ID>", format!("\"{id}\"").as_str());
    std::fs::write(predicate_code_path, predicate_code.to_string()).unwrap();

    let output_directory = format!("{order_directory}/out");

    let forc_path = format!("{DIR_PATH}/forc");
    let mut first_command = Command::new(&forc_path);
    first_command.arg("build");
    first_command.arg("--path");
    first_command.arg(order_directory);
    first_command.arg("--output-directory");
    first_command.arg(output_directory.clone());

    let exec = first_command.execute();
    if exec.is_err() {
        eprintln!("Failed. with error {:#?}", exec.err());
        web::Json(ResponseData::default())
    } else {
        exec.unwrap();
        let code = get_file_as_byte_vec(&format!("{output_directory}/swap-predicate.bin"));
        let data = ResponseData {
            id,
            code: serde_json::to_string(&code).unwrap(),
        };
        web::Json(data)
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
