use worker::*;

#[event(fetch)]
async fn fetch(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    let assets = env.service("ASSETS")?;
    let mut response = assets.fetch_request(req).await?;

    let ct = response.headers().get("content-type")?;
    let needs_charset = ct
        .as_deref()
        .is_some_and(|v| v.starts_with("text/html") && !v.contains("charset"));

    if needs_charset {
        let body = response.bytes().await?;
        let headers = Headers::new();
        for (k, v) in response.headers() {
            headers.set(&k, &v)?;
        }
        headers.set("content-type", "text/html; charset=utf-8")?;
        Ok(Response::from_bytes(body)?.with_headers(headers).with_status(response.status_code()))
    } else {
        Ok(response)
    }
}
