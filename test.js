let p = Promise.resolve(1)

function f(){
    console.log('f')
    throw 'f error'
}
function f1(){
    console.log('f1')
}
function f2(){
    console.log('f2')
}

function fe(){
    console.log('fe reject')
    // throw 'f error'
}

function f2e(){
    console.log('f2e reject')
}

p = p.then(f)
p = p.then(f1,fe)
p = p.then(f2,f2e)
// return p;

console.log(typeof f)