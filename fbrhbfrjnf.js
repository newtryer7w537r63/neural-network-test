// --- Color mode ---
document.getElementById("runBtnColor").addEventListener("click", () => {
    const inputValues = document.getElementById("inputValuesColor").value.split(",").map(Number);
    const targetColor = document.getElementById("targetColor").value.split(",").map(Number);
    const colorSquare = document.getElementById("colorSquare");

    // Fixed network: 1 hidden layer (3 neurons), 3 outputs
    const layers = [[],[]];
    for(let i=0;i<3;i++) layers[0].push({weights: inputValues.map(()=>Math.random()*2-1), bias: Math.random()*2-1, output:0, delta:0});
    for(let i=0;i<3;i++) layers[1].push({weights: Array(3).fill(0).map(()=>Math.random()*2-1), bias: Math.random()*2-1, output:0, delta:0});

    function forward(inputs){
        let current = inputs;
        layers.forEach((layer,i)=>{
            layer.forEach(n=>{
                let sum = n.weights.reduce((acc,w,idx)=>acc+w*current[idx],0)+n.bias;
                n.output = (i===layers.length-1)?linear(sum):relu(sum);
            });
            current = layer.map(n=>n.output);
        });
        return current;
    }

    function backward(inputs){
        forward(inputs);
        layers[1].forEach((n,i)=>n.delta=(targetColor[i]-n.output)*linearDerivative(n.output));
        layers[0].forEach((n,i)=>{
            let sum=layers[1].reduce((acc,next)=>acc+next.weights[i]*next.delta,0);
            n.delta = sum*reluDerivative(n.output);
        });
        layers.forEach((layer,l)=>{
            const layerInputs = l===0?inputs:layers[l-1].map(n=>n.output);
            layer.forEach(n=>{
                n.weights = n.weights.map((w,i)=>w+n.delta*layerInputs[i]*0.05);
                n.bias += n.delta*0.05;
            });
        });
    }

    let step=0;
    const interval = setInterval(()=>{
        backward(inputValues);
        const out = forward(inputValues);
        outputDiv.innerHTML = `Step ${step}<br>` +
            out.map((v,i)=>`RGB ${i+1}: ${Math.round(v)}`).join("<br>");
        // Update SVG fill color
        colorSquare.setAttribute("fill", `rgb(${out.map(v=>Math.min(Math.max(Math.round(v),0),255)).join(",")})`);
        step++;
        if(step>2000) clearInterval(interval);
    },20);
});
