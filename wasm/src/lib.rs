use std::f64::consts::PI;
use wasm_bindgen::prelude::*;

const CLAMP: f64 = 5.0;
const TAU: f64 = 2.0 * PI;

fn fmt_val(v: f64) -> String {
    if v.is_finite() && v.abs() <= CLAMP { format!("{:.10}", v) }
    else { String::from("null") }
}

#[wasm_bindgen]
pub fn trig_values(radians: f64) -> String {
    let s = radians.sin(); let c = radians.cos(); let t = radians.tan();
    let cot = 1.0 / t; let sec = 1.0 / c; let csc = 1.0 / s;
    let sv = if s.abs()<1e-12{0.0}else{s};
    let cv = if c.abs()<1e-12{0.0}else{c};
    let tv = if t.is_finite()&&t.abs()<=CLAMP{t}else if t.abs()<1e-12{0.0}else{f64::NAN};
    format!(r#"{{"pi":{:.15},"twopi":{:.15},"sin":{:.10},"cos":{:.10},"tan":{},"cot":{},"sec":{},"csc":{}}}"#,
        PI, TAU, sv, cv, fmt_val(tv),
        fmt_val(if cot.is_finite()&&cot.abs()<=CLAMP{cot}else if cot.abs()<1e-12{0.0}else{f64::NAN}),
        fmt_val(if sec.is_finite()&&sec.abs()<=CLAMP{sec}else{f64::NAN}),
        fmt_val(if csc.is_finite()&&csc.abs()<=CLAMP{csc}else{f64::NAN}))
}

#[wasm_bindgen]
pub fn trig_curve(func_id: &str, start_rad: f64, end_rad: f64, num_points: u32) -> String {
    let n = if num_points > 0 { num_points as usize } else { 200 };
    let step = (end_rad - start_rad) / (n as f64 - 1.0);

    let mut x = String::from("[");
    let mut y = String::from("[");
    let mut dy = String::from("[");

    for i in 0..n {
        let r = start_rad + (i as f64) * step;
        let (fv, dv) = match func_id {
            "sin" => (r.sin(), r.cos()),
            "cos" => (r.cos(), -r.sin()),
            "tan" => (r.tan(), { let c = r.cos(); 1.0 / (c * c) }),
            "cot" => { let s = r.sin(); (1.0 / r.tan(), -1.0 / (s * s)) },
            "sec" => { let c = r.cos(); (1.0 / c, r.sin() / (c * c)) },
            "csc" => { let s = r.sin(); (1.0 / s, -r.cos() / (s * s)) },
            _ => (0.0, 0.0),
        };

        if i > 0 { x.push(','); y.push(','); dy.push(','); }
        x.push_str(&format!("{:.8}", r));
        y.push_str(&fmt_val(fv));
        dy.push_str(&fmt_val(dv));
    }

    x.push(']'); y.push(']'); dy.push(']');
    format!(r#"{{"x":{},"y":{},"derivative_y":{}}}"#, x, y, dy)
}

#[wasm_bindgen]
pub fn trig_point(func_id: &str, radians: f64) -> String {
    let (value, derivative) = match func_id {
        "sin" => (radians.sin(), radians.cos()),
        "cos" => (radians.cos(), -radians.sin()),
        "tan" => { let c = radians.cos(); (radians.tan(), 1.0 / (c * c)) },
        "cot" => { let s = radians.sin(); (1.0 / radians.tan(), -1.0 / (s * s)) },
        "sec" => { let c = radians.cos(); (1.0 / c, radians.sin() / (c * c)) },
        "csc" => { let s = radians.sin(); (1.0 / s, -radians.cos() / (s * s)) },
        _ => (0.0, 0.0),
    };
    format!(r#"{{"value":{},"derivative":{}}}"#, fmt_val(value), fmt_val(derivative))
}

#[wasm_bindgen]
pub fn trig_info() -> String {
    r#"[
  {"id":"sin","name":"sin θ","latex":"\\sin(\\theta)","derivative_name":"cos θ","derivative_latex":"\\cos(\\theta)","color_index":0,"y_min":-1.5,"y_max":1.5},
  {"id":"cos","name":"cos θ","latex":"\\cos(\\theta)","derivative_name":"-sin θ","derivative_latex":"-\\sin(\\theta)","color_index":1,"y_min":-1.5,"y_max":1.5},
  {"id":"tan","name":"tan θ","latex":"\\tan(\\theta)","derivative_name":"sec² θ","derivative_latex":"\\sec^2(\\theta)","color_index":2,"y_min":-5,"y_max":5},
  {"id":"cot","name":"cot θ","latex":"\\cot(\\theta)","derivative_name":"-csc² θ","derivative_latex":"-\\csc^2(\\theta)","color_index":3,"y_min":-5,"y_max":5},
  {"id":"sec","name":"sec θ","latex":"\\sec(\\theta)","derivative_name":"sec θ tan θ","derivative_latex":"\\sec(\\theta)\\tan(\\theta)","color_index":4,"y_min":-5,"y_max":5},
  {"id":"csc","name":"csc θ","latex":"\\csc(\\theta)","derivative_name":"-csc θ cot θ","derivative_latex":"-\\csc(\\theta)\\cot(\\theta)","color_index":5,"y_min":-5,"y_max":5}
]"#.to_string()
}
