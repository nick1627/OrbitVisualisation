/*jshint esversion: 7 */
class Orbit{
    constructor(OrbitID, LongOfAscNode, Inclination, ArgOfPe, SemimajorAxis, Eccentricity){
        this.ID = OrbitID;
        this.LongOfAscNode = LongOfAscNode;
        this.Inclination = Inclination;
        this.ArgOfPe = ArgOfPe;
        this.a = SemimajorAxis;
        this.e = Eccentricity;

        //this.PlotData = this.GetPlotData();
    }

    GetPlotData(OrbitPath){
        let x = OrbitPath[0];
        let y = OrbitPath[1];
        let z = OrbitPath[2];

        let OrbitData = ({
            type: "scatter3d",
            mode: "lines",
            name: "Orbit",
            x: x,
            y: y,
            z: z,

            line: {
                width: 6,
                color: "blue",
                //reversescale: false
            }
        });


        // let AscendingNodeData = ({

        // });

        // let PeriapsisData = ({

        // });
        return [OrbitData];
        //return [OrbitData, AscendingNodeData, PeriapsisData];
    }

    GetPath(){
        //gets orbit path
        let a = this.a;
        let e = this.e;
        //first create x values.
        let n = 1000;
        let x = [];
        let y = [];
        let z = [];
        for (let i = 0; i <= n; i++){
            x.push(-a + i*(2*a/n));
            y.push(Math.sqrt((a**2 - x[i]**2)*(1 - e**2)));
            z.push(0);
        }
        for (let i = 0; i <= n; i++){
            x.push(a - i*(2*a/n));
            y.push(-Math.sqrt((a**2 - x[i]**2)*(1 - e**2)));
            z.push(0);
        }
        for (let i = 0; i < x.length; i++){
            x[i] = x[i] + a*e; //translate so origin is a focus.
        }

        let Path = this.Transform(x, y, z);

        return Path;
    }

    Transform(x, y, z){
        //transforms orbit points into actual 3d position
        let Omega = this.LongOfAscNode;
        let i = this.Inclination;
        let omega = this.ArgOfPe;

        Omega = -Omega;
        i = -i;
        omega = -omega;
        // console.log(Omega);
        // console.log(i);
        // console.log(omega);
        

        let OmegaMatrix = math.matrix([[Math.cos(Omega), Math.sin(Omega), 0], [-Math.sin(Omega), Math.cos(Omega), 0], [0, 0, 1]]);
        let iMatrix = math.matrix([[1, 0, 0], [0, Math.cos(i), Math.sin(i)], [0, -Math.sin(i), Math.cos(i)]]);
        let omegaMatrix = math.matrix([[Math.cos(omega), Math.sin(omega), 0], [-Math.sin(omega), Math.cos(omega), 0], [0, 0, 1]]);
        let RotationMatrix = math.multiply(OmegaMatrix, math.multiply(iMatrix, omegaMatrix));
        
        RotationMatrix = math.transpose(RotationMatrix);
        //console.log(RotationMatrix);
        
        let CurrentVector;
        let ResultVector;
        let NewX = [];
        let NewY = []; 
        let NewZ = [];

        //console.log(math.multiply(RotationMatrix, math.matrix([[0], [1], [0]])));

        for (let i = 0; i < x.length; i++){
            CurrentVector = math.matrix([[x[i]], [y[i]], [z[i]]]);
            ResultVector = math.multiply(RotationMatrix, CurrentVector);
            //console.log(math.index(0));
            //console.log(ResultVector);
            NewX.push(ResultVector.subset(math.index(0, 0)));
            NewY.push(ResultVector.subset(math.index(1, 0)));
            NewZ.push(ResultVector.subset(math.index(2, 0)));
        }
        //console.log(NewX);
        return [NewX, NewY, NewZ];
    }

    NewPlot(GraphName, GraphData, AxisLimit){
        Plotly.purge(GraphName);
        Plotly.newPlot(GraphName, GraphData, setLayout('x', 'y', 'z', AxisLimit));
    }

    UpdatePlot(GraphName, GraphData, AxisLimit){
        Plotly.react(GraphName, GraphData, setLayout('x', 'y', 'z', AxisLimit));
    }
}


function setLayout(sometitlex, sometitley, sometitlez, AxisLimit){
    //set layout of graphs. 
    
    let new_layout = {//layout of 3D graph
        //showlegend: false,
        //showscale: false,
        uirevision: 'dataset',
        margin: {
            l: 1, r: 1, b: 10, t: 1, pad: 0
        },
        dragmode: 'turntable',
        scene: {
            aspectmode: "cube",
            // xaxis: {range: [-0.05, 0.05], title: sometitlex},//, showticklabels: false},
            // yaxis: {range: [-0.01, 0.01], title: sometitley},//, showticklabels: false},
            // zaxis: {range: [-0.01, 0.01], title: sometitlez},//, showticklabels: false},
            xaxis: {range: [-AxisLimit, AxisLimit], title: sometitlex},//, showticklabels: false},
            yaxis: {range: [-AxisLimit, AxisLimit], title: sometitley},//, showticklabels: false},
            zaxis: {range: [-AxisLimit, AxisLimit], title: sometitlez},//, showticklabels: false},
            
            //aspectmode: "manual",
            aspectratio: {
                x: 5, y: 1, z: 1,
            },

            camera: {
                up: {x: 0, y: 0, z: 1},//sets which way is up
                eye: {x: 1, y: -1, z: 1}//adjust camera starting view
            }
        },
    };

    return new_layout;
}

function GetNewInputs(){
    let Omega = document.getElementById("LongOfAscNodeSlider").value;
    let i = document.getElementById("InclinationSlider").value;
    let omega = document.getElementById("ArgOfPeSlider").value;

    Omega = Omega*Math.PI/180; //convert angles to "radians".
    i = i*Math.PI/180;
    omega = omega*Math.PI/180;

    let a = document.getElementById("aSlider").value;
    a = a*10**4;
    let e = document.getElementById("eSlider").value;
   

    let Play = document.getElementById("PlayButton").value;
    let PlaySpeed = document.getElementById("SpeedSlider").value;

    return [Omega, i , omega, a, e, Play, PlaySpeed];
}

function GetReferenceAxis(AxisLimit){
    let AxisData = ({
        type: "scatter3d",
        mode: "lines",
        name: "Reference Direction",
        x: [0, AxisLimit],
        y: [0, 0],
        z: [0, 0],

        line: {
            width: 3,
            color: "red"
            //reversescale: false
        }
    });
    return AxisData;
}

function GetCartesianAxes(AxisLimit){
    let xAxis = ({
        type:"scatter3d",
        mode: "lines",
        name: "xAxis",
        x: [-AxisLimit, AxisLimit],
        y: [0, 0],
        z: [0, 0],

        line:{
            width: 3,
            color:"red"
        }
    });

    let yAxis = ({
        type:"scatter3d",
        mode: "lines",
        name: "yAxis",
        x: [0, 0],
        y: [-AxisLimit, AxisLimit],
        z: [0, 0],

        line:{
            width: 3,
            color:"green"
        }
    });

    let zAxis = ({
        type:"scatter3d",
        mode: "lines",
        name: "zAxis",
        x: [0, 0],
        y: [0, 0],
        z: [-AxisLimit, AxisLimit],

        line:{
            width: 3,
            color:"blue"
        }
    });

    return [xAxis, yAxis, zAxis];
}

function Main(PlotNew = false){
    let AxisLimit = 2*10**5;
    let NewVariables = GetNewInputs();
    let Omega = NewVariables[0];
    let i = NewVariables[1];
    let omega = NewVariables[2];
    let a = NewVariables[3];
    let e = NewVariables[4];
    let Play = NewVariables[5];
    let PlaySpeed = NewVariables[6];

    let OrbitA = new Orbit(1, Omega, i, omega, a, e);
    let OrbitPath = OrbitA.GetPath();
    let PlotData = OrbitA.GetPlotData(OrbitPath);

    //PlotData.push(GetReferenceAxis(AxisLimit));
    let AxisData = GetCartesianAxes(AxisLimit)
    PlotData.push(AxisData[0]);
    PlotData.push(AxisData[1]);
    PlotData.push(AxisData[2]);

    if (PlotNew){
        OrbitA.NewPlot("3DGraph", PlotData, AxisLimit);
    }else{
        OrbitA.UpdatePlot("3DGraph", PlotData, AxisLimit);
    }
}

function Initialise() {
    $('#LongOfAscNodeSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        Main();
    });

    $('#InclinationSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        Main();
    });

    $('#ArgOfPeSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        Main();
    });

    $('#aSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        Main();
    });

    $('#eSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        Main();
    });

    $('#InclinationSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        Main();
    });

    $('#PlayButton').on("click", function(){

        if (document.getElementById("PlayButton").value == "false"){
            $('#PlayButton').html("Pause");
            document.getElementById("PlayButton").value = "true";
            Main();
        }else{
            $('#PlayButton').html("Play");
            window.cancelAnimationFrame(ID);
            document.getElementById("PlayButton").value = "false";
        }
    });

    $('#SpeedSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        Main();
    });

    Main(PlotNew = true); //update plots upon setup.  This is the first time graphs are run upon opening the page
}

$(document).ready(Initialise); //Load initialise when document is ready.