use anyhow::Result;
use axum::Router;
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::State;
use axum::response::IntoResponse;
use notify::{EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use std::net::SocketAddr;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::sync::broadcast;
use tower_http::services::ServeDir;

use crate::build;

struct AppState {
    reload_tx: broadcast::Sender<()>,
    project_dir: PathBuf,
}

const LIVE_RELOAD_SCRIPT: &str = r#"<script>
(function(){var ws=new WebSocket("ws://"+location.host+"/ws");ws.onmessage=function(e){if(e.data==="reload")location.reload()};ws.onclose=function(){setTimeout(function(){location.reload()},2000)}})();
</script>"#;

fn inject_live_reload(dist_dir: &Path) -> Result<()> {
    for entry in glob::glob(&format!("{}/**/*.html", dist_dir.display()))? {
        let path = entry?;
        let content = std::fs::read_to_string(&path)?;
        if !content.contains("ws://") {
            let injected = content.replace("</body>", &format!("{LIVE_RELOAD_SCRIPT}\n</body>"));
            std::fs::write(&path, injected)?;
        }
    }
    Ok(())
}

pub async fn run(project_dir: &Path, port: u16) -> Result<()> {
    println!("Building...");
    build::run(project_dir)?;
    inject_live_reload(&project_dir.join("dist"))?;

    let (reload_tx, _) = broadcast::channel::<()>(16);
    let state = Arc::new(AppState {
        reload_tx: reload_tx.clone(),
        project_dir: project_dir.to_path_buf(),
    });

    let dist_dir = project_dir.join("dist");

    let app = Router::new()
        .route("/ws", axum::routing::get(ws_handler))
        .fallback_service(ServeDir::new(&dist_dir).append_index_html_on_directories(true))
        .with_state(state.clone());

    let watcher_state = state.clone();
    let articles_dir = project_dir.join("articles");
    let templates_dir = project_dir.join("templates");

    std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async {
            let (tx, mut rx) = tokio::sync::mpsc::channel(32);

            let mut watcher: RecommendedWatcher =
                notify::recommended_watcher(move |res: notify::Result<notify::Event>| {
                    if let Ok(event) = res {
                        match event.kind {
                            EventKind::Create(_)
                            | EventKind::Modify(_)
                            | EventKind::Remove(_) => {
                                let _ = tx.blocking_send(());
                            }
                            _ => {}
                        }
                    }
                })
                .unwrap();

            if articles_dir.exists() {
                let _ = watcher.watch(&articles_dir, RecursiveMode::Recursive);
            }
            if templates_dir.exists() {
                let _ = watcher.watch(&templates_dir, RecursiveMode::Recursive);
            }

            let mut debounce = tokio::time::Instant::now();

            loop {
                if rx.recv().await.is_some() {
                    let now = tokio::time::Instant::now();
                    if now.duration_since(debounce).as_millis() < 500 {
                        continue;
                    }
                    debounce = now;

                    println!("Change detected, rebuilding...");
                    match build::run(&watcher_state.project_dir) {
                        Ok(_) => {
                            let _ = inject_live_reload(
                                &watcher_state.project_dir.join("dist"),
                            );
                            let _ = watcher_state.reload_tx.send(());
                            println!("Rebuild complete");
                        }
                        Err(e) => {
                            eprintln!("Build error: {e}");
                        }
                    }
                }
            }
        });
    });

    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    println!("Listening on http://localhost:{port}");
    println!("Watching for changes...");

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_ws(socket, state))
}

async fn handle_ws(mut socket: WebSocket, state: Arc<AppState>) {
    let mut rx = state.reload_tx.subscribe();

    loop {
        tokio::select! {
            result = rx.recv() => {
                match result {
                    Ok(_) => {
                        if socket.send(Message::Text("reload".into())).await.is_err() {
                            break;
                        }
                    }
                    Err(_) => break,
                }
            }
            msg = socket.recv() => {
                match msg {
                    Some(Ok(_)) => {}
                    _ => break,
                }
            }
        }
    }
}
