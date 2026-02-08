use std::collections::HashMap;

pub fn render(template: &str, vars: &HashMap<&str, String>) -> String {
    let mut result = template.to_string();
    for (key, value) in vars {
        result = result.replace(&format!("{{{{{key}}}}}"), value);
    }
    result = remove_unused_placeholders(&result);
    result
}

fn remove_unused_placeholders(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let bytes = s.as_bytes();
    let len = bytes.len();
    let mut i = 0;

    while i < len {
        if i + 1 < len && bytes[i] == b'{' && bytes[i + 1] == b'{' {
            let start = i + 2;
            let mut end = None;
            let mut j = start;
            while j + 1 < len {
                if bytes[j] == b'}' && bytes[j + 1] == b'}' {
                    end = Some(j);
                    break;
                }
                j += 1;
            }
            if let Some(e) = end {
                i = e + 2;
            } else {
                result.push('{');
                result.push('{');
                result.push_str(&s[start..]);
                break;
            }
        } else {
            result.push(bytes[i] as char);
            i += 1;
        }
    }

    result
}
