use std::collections::HashMap;

pub fn render(template: &str, vars: &HashMap<&str, String>) -> String {
    let mut result = template.to_string();
    for (key, value) in vars {
        result = result.replace(&format!("{{{{{key}}}}}"), value);
    }
    remove_unused_placeholders(&result)
}

fn remove_unused_placeholders(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '{' && chars.peek() == Some(&'{') {
            chars.next();
            let mut closed = false;
            loop {
                match chars.next() {
                    Some('}') if chars.peek() == Some(&'}') => {
                        chars.next();
                        closed = true;
                        break;
                    }
                    Some(_) => {}
                    None => break,
                }
            }
            if !closed {
                result.push('{');
                result.push('{');
            }
        } else {
            result.push(c);
        }
    }

    result
}
