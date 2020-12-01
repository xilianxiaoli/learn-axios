let p = Promise.resolve(1)

function f(){
    console.log('f')
}
function f1(){
    console.log('f1')
}
function f2(){
    console.log('f2')
}

p = p.then(f)
p = p.then(f1)
p = p.then(f2)
return p;