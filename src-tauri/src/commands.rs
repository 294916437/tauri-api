use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use std::fs;
use std::path::Path;
use std::process::Command;
use tauri::{command, AppHandle};

#[command]
pub fn my_custom_command(argument: String) -> String {
    println!("I was invoked from JS with this message: {}", argument);
    "Hello from Rust!".into()
}

#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct InferenceResult {
    prediction: String,
    confidence: f32,
    class_probabilities: HashMap<String, f32>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ErrorResult {
    error: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum ModelResult {
    Success(InferenceResult),
    Error(ErrorResult),
}

// 获取Python可执行文件路径的辅助函数
fn get_python_executable() -> String {
    // 尝试从环境变量获取路径
    match env::var("PYTHON_EXECUTABLE_PATH") {
        Ok(path) => path,
        Err(_) => {
            // 如果环境变量不存在，尝试从PYTHON_VENV_PATH构建路径
            match env::var("PYTHON_VENV_PATH") {
                Ok(venv_path) => {
                    if cfg!(target_os = "windows") {
                        format!("{}\\python.exe", venv_path)
                    } else {
                        format!("{}/bin/python", venv_path)
                    }
                }
                // 如果都没有设置，使用系统默认python
                Err(_) => "python".to_string(),
            }
        }
    }
}

#[command]
pub async fn process_image(
    app_handle: AppHandle,
    image_path: String,
) -> Result<ModelResult, String> {
    // 获取应用路径
    let app_dir = app_handle
        .path_resolver()
        .app_dir()
        .ok_or("无法获取应用目录")?;

    // 模型路径 (需确保模型已放置在此位置)
    let model_path = app_dir
        .join("resources")
        .join("model")
        .join("result_improved.pth");

    // Python脚本路径
    let script_path = app_dir.join("python").join("inference.py");

    // 获取Python可执行文件路径
    let python_executable = get_python_executable();

    // 确认Python环境可用
    let env_check = Command::new(&python_executable)
        .arg("--version")
        .output()
        .map_err(|e| format!("Python环境检查失败: {}", e))?;

    if !env_check.status.success() {
        let stderr = String::from_utf8_lossy(&env_check.stderr);
        return Err(format!("Python环境不可用: {}", stderr));
    }

    // 记录使用的Python路径
    println!("使用Python路径: {}", python_executable);

    // 执行Python脚本
    let output = Command::new(&python_executable)
        .arg(script_path.to_str().ok_or("无效的脚本路径")?)
        .arg(image_path)
        .arg(model_path.to_str().ok_or("无效的模型路径")?)
        .output()
        .map_err(|e| format!("执行Python脚本失败: {}", e))?;

    // 解析输出
    let stdout = String::from_utf8(output.stdout).map_err(|e| format!("无法解析输出: {}", e))?;

    // 如果存在错误输出，记录它
    if !output.stderr.is_empty() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        println!("Python脚本警告/错误: {}", stderr);
    }

    // JSON解析
    let result: ModelResult =
        serde_json::from_str(&stdout).map_err(|e| format!("结果解析失败: {}", e))?;

    Ok(result)
}

#[command]
pub async fn save_uploaded_image(
    app_handle: AppHandle,
    file_data: Vec<u8>,
    file_name: String,
) -> Result<String, String> {
    // 创建上传目录
    let app_dir = app_handle
        .path_resolver()
        .app_dir()
        .ok_or("无法获取应用目录")?;
    let upload_dir = app_dir.join("uploads");
    fs::create_dir_all(&upload_dir).map_err(|e| e.to_string())?;

    // 保存文件
    let file_path = upload_dir.join(&file_name);
    fs::write(&file_path, file_data).map_err(|e| e.to_string())?;

    Ok(file_path.to_str().ok_or("路径转换失败")?.to_string())
}
