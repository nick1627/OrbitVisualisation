/*jshint esversion: 7 */

class SpaceTimeDiagram{
    constructor(Name, Frames, Events, FrameID){
        this.Name = Name;//name of graph to link to html
        this.Frames = Frames;//an array of frames
        this.Events = Events;//an array of events
        this.FrameID = FrameID;  //assigns a particular frame to be the frame of this diagram
        //this.FrameColourList = FrameColourList;
        this.Beta = Frames[FrameID].FrameBeta;
        this.Gamma = GetGamma(this.Beta);
    }

    UpdateFrames(NewFrames){
        this.Frames = NewFrames;
    }

    UpdateEvents(NewEvents){
        this.Events = NewEvents;
    }

    Plot(NewPlot = false){
        let Beta = this.Beta;
        let Gamma = this.Gamma;
        let Events = this.Events;
        let Frames = this.Frames;

        let Betas = [];
        let Gammas = [];
        for (let i = 0; i< Frames.length; i++){
            Betas.push(Frames[i].FrameBeta);
            Gammas.push(Frames[i].FrameGamma);
        }



        let PlotData = [];

        let Temporary;

        let FrameColours = [];
        for (let i = 0; i< Frames.length; i++){
            FrameColours.push(Frames[i].FrameColour);
        }



        for (let i = 0; i < Events.length; i++){
            Temporary = Events[i].GetDrawData(this.FrameID, Betas, Gammas, FrameColours);
            for (let j = 0; j < Temporary.length; j++){
                PlotData.push(Temporary[j]);
            }
        }

        for (let i = 0; i < Frames.length; i++){
            Temporary = Frames[i].GetDrawData(Beta); //should really give gamma here too... SORT THIS OUT.
            for (let j = 0; j < Temporary.length; j++){
                PlotData.push(Temporary[j]);
            }
        }

        
        if (NewPlot){
            this.NewPlot(PlotData);
        }else{
            this.React(PlotData);
        }
        
    }


    NewPlot(DiagramData){
        Plotly.purge(this.Name);

        //let xLabel = this.Frames[this.FrameID].AxisNames[0];
        //let ctLabel = this.Frames[this.FrameID].AxisNames[1];
        Plotly.newPlot(this.Name, DiagramData, this.SetLayout("xLabel", "ctLabel"));
    }

    React(DiagramData){
        //let xLabel = this.Frames[this.FrameID].AxisNames[0];
        //let ctLabel = this.Frames[this.FrameID].AxisNames[1];

        Plotly.react(this.Name, DiagramData, this.SetLayout("xLabel", "ctLabel"));
    }

    SetLayout(sometitlex, sometitley) {
        const new_layout = {
            autosize: true,
            margin: {l: 45, r: 30, t: 30, b: 30},
            hovermode: "closest",
            showlegend: false,
            xaxis: {range: [-100, 100], zeroline: true, title: sometitlex},
            yaxis: {range: [-100, 100], zeroline: true, title: sometitley},
            aspectratio: {x: 1, y: 1}
        };
        return new_layout;
    }
    
}

class Frame{
    constructor(Name, FrameBeta, FrameColour = "blue", AxisLength = 100){
        this.Name = Name;
        this.FrameBeta = FrameBeta;
        this.FrameGamma = GetGamma(FrameBeta);
        this.FrameColour = FrameColour;
        this.AxisEndpointPositions = this.GetAxisEndpointPositions(-this.FrameBeta, [[AxisLength, 0], [-AxisLength, 0], [0, -AxisLength], [0, AxisLength]]);
    }
    
    GetAxisEndpointPositions(Beta, AxisEndpointPositions = this.AxisEndpointPositions){
        //if you give no position, this function will find you the axis endpoint positions
        //in the frame with beta of your choice.
        let Gamma = GetGamma(Beta);

        for (let i = 0; i < AxisEndpointPositions.length; i++){
            AxisEndpointPositions[i] = LorentzTransform(AxisEndpointPositions[i], Beta, Gamma);
        }

        return AxisEndpointPositions;
    }

    GetDrawData(Beta){
        //gets the draw data necessary for an observer with speed beta

        let AxisEndpointPositions = this.GetAxisEndpointPositions(Beta); //shouldn't this need gamma as well?  save computing time
        let DrawData = [];

        DrawData.push({//push axis line stuff
            type: "scatter",
            mode: "lines",
            line: {
                width: 2,
                color: this.FrameColour
            },
            x: [AxisEndpointPositions[0][1], AxisEndpointPositions[1][1]],
            y: [AxisEndpointPositions[0][0], AxisEndpointPositions[1][0]]
        });

        DrawData.push({//push axis line stuff
            type: "scatter",
            mode: "lines",
            line: {
                width: 2,
                color: this.FrameColour
            },
            x: [AxisEndpointPositions[2][1], AxisEndpointPositions[3][1]],
            y: [AxisEndpointPositions[2][0], AxisEndpointPositions[3][0]]
        });

        return DrawData;
    }
}


class Event{
    constructor(Name, TableRow, Position, BetaForPosition, EventColour = "blue"){
        this.Name = Name;
        this.TableRow = TableRow;
        this.Position = LorentzTransform(Position, -BetaForPosition, GetGamma(-BetaForPosition));
        //this.AxisPoints = this.GetAxisPoints(this.Position); //nothing special here, just
        //the points corresponding to the axis points if beta is 0.  They can be 
        //transformed with a lorentz transformation later.
        this.EventColour = EventColour;
    }

    GetTransformedPosition(Beta, Gamma, Position = this.Position){
        let ct = Position[0];
        let x = Position[1];
    
        let ctDash = Gamma*(ct - Beta*x);
        let xDash = Gamma*(x - Beta*ct);
    
        return [ctDash, xDash];
    }

    GetAxisPoints(Position, Betas, Gammas){
        //betas of frames you want axis points in 
        let TempTransformedPosition;
        let TempctAxisPosition;
        let TempxAxisPosition;
        let xAxisPositions = [];
        let ctAxisPositions = [];

        for (let i = 0; i< Betas.length; i++){
            TempTransformedPosition = LorentzTransform(Position, Betas[i], Gammas[i]);
            TempctAxisPosition = [TempTransformedPosition[0], 0];
            TempxAxisPosition = [0, TempTransformedPosition[1]];
            
            TempctAxisPosition = LorentzTransform(TempctAxisPosition, -Betas[i], Gammas[i]);
            TempxAxisPosition = LorentzTransform(TempxAxisPosition, -Betas[i], Gammas[i]);

            ctAxisPositions.push(TempctAxisPosition);
            xAxisPositions.push(TempxAxisPosition);
        }

        return [ctAxisPositions, xAxisPositions];
    }

    GetAxisPoints2(Position, Beta){
        let ctAxisPoint = [Position[0], 0];
        let xAxisPoint = [0, Position[1]];

        return [ctAxisPoint, xAxisPoint];
    }

    GetDrawData(ID, Betas, Gammas, FrameColours){
        //ID is the index of the beta we are drawing the point with.
        let PositionToPlot = this.GetTransformedPosition(Betas[ID], Gammas[ID]);
        //ctAxisPositionToPlot.push([this.GetTransformedPosition(Beta, Gamma, this.AxisPoints[0]), this.GetTransformedPosition(Beta, Gamma, this.AxisPoints[1])]);

        let DrawData = [];

        let Betas2 = [];
        let Gammas2 = [];
        for (let i = 0; i< Betas.length; i++){
            Betas2[i] = Betas[i] - Betas[ID];
            Gammas2[i] = GetGamma(Betas2[i]);
        }

        let AxisPoints = this.GetAxisPoints(PositionToPlot, Betas2, Gammas2);
        let ctAxisPositions = AxisPoints[0];
        let xAxisPositions = AxisPoints[1];
        
        for (let i = 0; i<ctAxisPositions.length; i++){
            if (i != ID){
                DrawData.push({//push dotted line stuff
                    type: "scatter",
                    mode: "lines",
                    line: {
                        dash: 'dash',
                        width: 2,
                        color: FrameColours[ID]
                    },
                    x: [ctAxisPositions[i][1], PositionToPlot[1], xAxisPositions[i][1]],
                    y: [ctAxisPositions[i][0], PositionToPlot[0], xAxisPositions[i][0]]
                });
            }
        }
        

        

        DrawData.push({//push marker stuff
            type: "scatter",
            mode: "markers",
            marker: {
                size: 10, 
                color: this.EventColour
            },
            x:  [PositionToPlot[1]],
            y:  [PositionToPlot[0]]
        });

        return DrawData;
    }
}

class Table{
    constructor(TableName, MaxRows, Betas, Gammas){
        this.Name = TableName;
        this.MaxRows = MaxRows;
        this.Betas = Betas;
        this.Gammas = Gammas;
        this.Events = this.GetAllEvents(this.MaxRows, this.Betas, this.Gammas);
    }

    WriteCell(Row, Column, Data){
        document.getElementById(this.Name).rows[Row].cells[Column].innerHTML = Math.round(Data*100)/100;
    }

    ReadCell(Row, Column){
        let Result = parseFloat(document.getElementById(this.Name).rows[Row].cells[Column].innerHTML);
        if ((typeof Result == "undefined")|(isNaN(Result))){
            return "UNDEFINED";
        }else{
            return Result;
        }
    }

    WriteRow(Row, Data){
        for (let i = 0; i<Data.length; i++){
            this.WriteCell(Row, i, Data[i]);
        }
    }

    ReadRow(Row, NumberOfColumns){
        let Result = [];
        for (let i = 0; i<NumberOfColumns; i++){
            Result.push(this.ReadCell(Row, i));
        }
        return Result;
    }

    ClearTable(){
        let MaxEvents = this.MaxRows;
        for (let i = 1; i<= MaxEvents; i++){
            for (let j = 0; j< 4; j++){
                document.getElementById(this.Name).rows[i].cells[j].innerHTML = null;
            }
        }
    }


    AddEvent(ct, x){
        let MaxEvents = this.MaxRows;
        let Betas = this.Betas;
        let Gammas = this.Gammas;
        let CurrentEvents = this.Events;

        let RowToFill = CurrentEvents.length + 1;
    
        //let NewEvent = new Event(CurrentEvents.length + 1, ct, x, Betas);
        let NewEvent = new Event("NewEvent", CurrentEvents.length + 1, [ct, x], 0);
    
        if (RowToFill <= MaxEvents){
            this.WriteRow(RowToFill, [NewEvent.Position[1], NewEvent.Position[0], NewEvent.GetTransformedPosition(Betas[1], Gammas[1])[1], NewEvent.GetTransformedPosition(Betas[1], Gammas[1])[0]]);
        }
    }

    GetAllEvents(MaxEvents, Betas, Gammas){ //consider making the table an object...
        let Events = [];

        let x;
        let ct;

        for (let i = 1; i < (MaxEvents + 1); i++){
            let RowData = this.ReadRow(i, 4);

            if (RowData[0] != "UNDEFINED"){
                x = RowData[0];
                ct = RowData[1];

                Events.push(new Event("name", i, [ct, x], Betas[0]));
            }
        }
    
        return Events;
    }

    UpdateValues(Betas, Gammas){
        let Events = this.GetAllEvents(5, Betas[0], Gammas[0]);
        let NewPositions = [];
        for (let i = 0; i < Events.length; i++){
            NewPositions[i] = Events[i].GetTransformedPosition(Betas[1], Gammas[1]);
        }
        for (let i = 1; i<Events.length; i++){
            for (let j = 2; j<=3; j++){
                this.WriteCell(i, j, NewPositions[j-2]);
            }
        }

    }
}


function GetGamma(Beta){
    let Gamma = 1/(Math.sqrt(1-Beta**2));
    return Gamma;
}

function LorentzTransform(Position, Beta, Gamma){
    let ct = Position[0];
    let x = Position[1];

    let ctDash = Gamma*(ct - Beta*x);
    let xDash = Gamma*(x - Beta*ct);

    return [ctDash, xDash];
}

function GetNewInputs(){
    let FrameBeta = parseFloat(document.getElementById("FrameBetaController").value);
    ///let ObjectBeta = parseFloat(document.getElementById("ObjectBetaController").value);
    return FrameBeta;
}


function Main(NewPlots = false, ClearTable = false){ 
    let FrameBeta = GetNewInputs();

    let MaxEvents = 5;

    let Betas = [0, FrameBeta];

    let Gammas = [];
    for (let i = 0; i < Betas.length; i++){
        Gammas.push(GetGamma(Betas[i]));
    }

    let TableA = new Table("EventTable", MaxEvents, Betas, Gammas);
    if (ClearTable){
        TableA.ClearTable();
    }
    TableA.UpdateValues(Betas, Gammas);
    let Events = TableA.Events;

    let FrameA = new Frame("FrameA", Betas[0], "blue", 100);
    let FrameB = new Frame("FrameB", Betas[1], "green", 100);
    let Frames = [FrameA, FrameB];

    let FirstDiagram = new SpaceTimeDiagram("graph1", Frames, Events, 0);
    let SecondDiagram = new SpaceTimeDiagram("graph2", Frames, Events, 1);

    if (NewPlots){
        FirstDiagram.Plot(true);
        SecondDiagram.Plot(true);
    }else{
        FirstDiagram.Plot();
        SecondDiagram.Plot();
    }
}

function Setup(){
    $('#FrameBetaController').on("input", function(){
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        Main(NewPlots = false, ClearTable = false);
    });

    $("#SubmitButton").on("click", function(){
        let x = parseFloat(document.getElementById("EventX").value);
        let ct = parseFloat(document.getElementById("EventY").value);
        
        let Betas = [0, parseFloat(document.getElementById("FrameBetaController").value)];
        let Gammas = [GetGamma(Betas[0]), GetGamma(Betas[1])];

        let TableA = new Table("EventTable", 5, Betas, Gammas);
        TableA.AddEvent(ct, x);

        Main(NewPlots = false, ClearTable = false);
    });

    $("#ClearButton").on("click", function(){
        //MaxEvents = 5;
        //ClearEvents(MaxEvents);
        Main(NewPlots = false, ClearTable = true);
        Main(NewPlots = false, ClearTable = false);
    });
    
    Main(NewPlots = true, ClearTable = true);
}

$(document).ready(Setup); //Load setup when document is ready.