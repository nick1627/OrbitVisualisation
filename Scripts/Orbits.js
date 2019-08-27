/*jshint esversion: 7 */
class Orbit{
    constructor(OrbitID, LongOfAscNode, Inclination, ArgOfPe, SemimajorAxis, Eccentricity){
        this.ID = OrbitID;
        this.LongOfAscNode = LongOfAscNode;
        this.Inclination = Inclination;
        this.ArgOfPe = ArgOfPe;
        this.a = SemimajorAxis;
        this.e = Eccentricity;
    }

    GetPath(){
        //gets orbit path on 2d plane
    }

    Transform(){
        //transforms orbit points into actual 3d position
    }

    PlotOrbit(GraphName){
        //get orbit data
        //plot orbit data

    }
}

function GetNewInputs(){
    let Omega = document.getElementById("LongOfAscNodeSlider").value;
    let i = document.getElementById("InclinationSlider").value;
    let omega = document.getElementById("ArgOfPeSlider").value;

    let a = document.getElementById("aSlider").value;
    let e = document.getElementById("eSlider").value;
   

    let Play = document.getElementById("PlayButton").value;
    let PlaySpeed = document.getElementById("SpeedSlider").value;

    return [Omega, i , omega, a, e, Play, PlaySpeed];
}

function Main(PlotNew = false){
    NewVariables = GetNewInputs();
    let Omega = NewVariables[0];
    let i = NewVariables[1];
    let omega = NewVariables[2];
    let a = NewVariables[3];
    let e = NewVariables[4];
    let Play = NewVariables[5];
    let PlaySpeed = NewVariables[6];

    let OrbitA = new Orbit(1, Omega, i, omega, a, e);
    OrbitA.GetPath();
    OrbitA.GetPlotData();

    if (PlotNew){
        OrbitA.NewPlot("3DGraph");
    }else{
        OrbitA.UpdatePlot("3DGraph");
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