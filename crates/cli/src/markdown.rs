use pulldown_cmark::{Event, Options, Parser, Tag};

pub fn render(source: &str, article_id: &str) -> String {
    let mut opts = Options::empty();
    opts.insert(Options::ENABLE_STRIKETHROUGH);
    opts.insert(Options::ENABLE_TABLES);

    let parser = Parser::new_ext(source, opts);
    let events: Vec<Event> = parser
        .map(|event| rewrite_image_paths(event, article_id))
        .collect();

    let mut html = String::new();
    pulldown_cmark::html::push_html(&mut html, events.into_iter());
    html
}

fn rewrite_image_paths<'a>(event: Event<'a>, article_id: &str) -> Event<'a> {
    match event {
        Event::Start(Tag::Image {
            link_type,
            dest_url,
            title,
            id,
        }) => {
            let dest = dest_url.to_string();
            if dest.starts_with("./") || (!dest.starts_with("http") && !dest.starts_with('/')) {
                let clean = dest.strip_prefix("./").unwrap_or(&dest);
                let new_dest = format!("/{article_id}/{clean}");
                Event::Start(Tag::Image {
                    link_type,
                    dest_url: new_dest.into(),
                    title,
                    id,
                })
            } else {
                Event::Start(Tag::Image {
                    link_type,
                    dest_url,
                    title,
                    id,
                })
            }
        }
        _ => event,
    }
}
