window.onload = () => {

    const outputDiv = document.getElementById("output");
    const colorSquare = document.getElementById("colorSquare");

    // --- Tabs ---
    const tabButtons = document.querySelectorAll(".tabBtn");
    const tabContents = document.querySelectorAll(".tabContent");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            tabContents.forEach(c => c.style.display = c.id === btn.dataset.tab ? "block" : "none");
        });
    });
    tabButtons[0].click(); // default active

    // --- Activation functions ---
    function relu(x) { return Math.max(0, x); }
    function reluDerivative(x) { return x > 0 ? 1 : 0; }
    function linear(x) { return x; }
    function linearDerivative(x) { return 1; }

    // --- Number Mode ---
    document.getElementById("runBtnNumber").addEventListener("click", () => {
        const inputValues = document.getElementById("inputValuesNumber").value.split(",").map(Number);
        const numLayers = Number(document.getElementById("numLayers").value);
        const target = Number(document.getElementById("targetValue").value);

        let neuronsInput = document.getElementById("neuronsPerLayer").value.split(",").map(Number);
        outputDiv.innerHTML = "";

        if (neuronsInput.length === 1 && numLayers > 1) neuronsInput = Array(numLayers).fill(neuronsInput[0]);
        if (neuronsInput.length !== numLayers) {
            outputDiv.innerHTML = "Error: Number of layers and neuron counts do not match.";
            return;
        }

        let layers = [];
        let prev = inputValues;
        for (let l = 0; l < numLayers; l++) {
            const layer = [];
            for (let n = 0; n < neuronsInput[l]; n++) {
                layer.push({weights: prev.map(()=>Math.random()*2-1), bias: Math.random()*2-1, output:0, delta:0});
            }
            layers.push(layer);
            prev = new Array(neuronsInput[l]).fill(0);
        }

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
            layers[layers.length-1].forEach(n=>n.delta=(target-n.output)*linearDerivative(n.output));
            for (let l=layers.length-2;l>=0;l--){
                layers[l].forEach((n,i)=>{
                    let sum = layers[l+1].reduce((acc,next)=>acc+next.weights[i]*next.delta,0);
                    n.delta = sum*reluDerivative(n.output);
                });
            }
            const learningRate = 0.05;
            layers.forEach((layer,l)=>{
                const layerInputs = l===0?inputs:layers[l-1].map(n=>n.output);
                layer.forEach(n=>{
                    n.weights=n.weights.map((w,i)=>w+n.delta*layerInputs[i]*learningRate);
                    n.bias+=n.delta*learningRate;
                });
            });
        }

        let step=0;
        const interval = setInterval(()=>{
            backward(inputValues);
            const out = forward(inputValues);
            outputDiv.innerHTML = `Step ${step}<br>` +
                out.map((v,i)=>`Neuron ${i+1}: ${v.toFixed(3)}`).join("<br>");
            step++;
            if(step>2000) clearInterval(interval);
        },20);
    });

    // --- Color Mode ---
    document.getElementById("runBtnColor").addEventListener("click", () => {
        const inputValues = document.getElementById("inputValuesColor").value.split(",").map(Number);
        const targetColor = document.getElementById("targetColor").value.split(",").map(Number);

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
            const learningRate = 0.05;
            layers.forEach((layer,l)=>{
                const layerInputs = l===0?inputs:layers[l-1].map(n=>n.output);
                layer.forEach(n=>{
                    n.weights = n.weights.map((w,i)=>w+n.delta*layerInputs[i]*learningRate);
                    n.bias += n.delta*learningRate;
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
            colorSquare.setAttribute(
                "fill",
                `rgb(${out.map(v=>Math.min(Math.max(Math.round(v),0),255)).join(",")})`
            );
            step++;
            if(step>2000) clearInterval(interval);
        },20);
    });

};
