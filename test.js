let p = Promise.resolve(1);

function f() {
  console.log("f");
  throw "f error";
}
function f1() {
  console.log("f1");
}
function f2() {
  console.log("f2");
}

function fe() {
  console.log("fe reject");
  // throw 'f error'
}

function f2e() {
  console.log("f2e reject");
}

p = p.then(f);
p = p.then(f1, fe);
p = p.then(f2, f2e);
// return p;

console.log(typeof f);

// 从复杂对象中获取path对应的值
function extractValue(path, view) {
  // Short circuit for direct matches.
  if (view && view[path]) return view[path];

  var parts = path.split(".");

  while (
    // view should always be truthy as all objects are.
    view &&
    // must have a part in the dotted path
    (part = parts.shift())
  ) {
    view = typeof view === "object" && part in view ? view[part] : undefined;
  }

  return view;
}

console.log("extractValue:", extractValue("a.b.c", { a: { b: { c: 123 } } }));
