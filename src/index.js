import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

import { Oscillator, Waveform } from "tone";
import {
  Container,
  Grid,
  Slider,
  Button,
  IconButton,
  Select,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import RemoveIcon from "@material-ui/icons/Remove";
import AddIcon from "@material-ui/icons/Add";
import p5 from "p5";

class App extends React.Component {
  // oscil = new Oscillator().toMaster();

  oscil1 = new Oscillator().toMaster();
  oscil2 = new Oscillator().toMaster();

  constructor(props) {
    super(props);
    this.state = {
      isPlaying: false,
      note: "C",
      waveform: new Waveform(128),
    };
    this.osc1 = React.createRef();
    this.osc2 = React.createRef();
    this.oscil1.connect(this.state.waveform);
    this.oscil2.connect(this.state.waveform);
  }

  updateOscillators = () => {
    this.oscil1.type = this.osc1.current.state.oscType;
    this.oscil1.frequency.value =
      this.notes.find((note) => note.label === this.state.note).freq *
        Math.pow(2, this.osc1.current.state.octave - 2) +
      this.osc1.current.state.detune;
    this.oscil1.volume.value = this.osc1.current.state.volume;

    this.oscil2.type = this.osc2.current.state.oscType;
    this.oscil2.frequency.value =
      this.notes.find((note) => note.label === this.state.note).freq *
        Math.pow(2, this.osc2.current.state.octave - 2) +
      this.osc2.current.state.detune;
    this.oscil2.volume.value = this.osc2.current.state.volume;
  };

  playSound = () => {
    this.setState({ isPlaying: true });
    this.updateOscillators();
    this.oscil1.start();
    this.oscil2.start();
  };

  stopSound = () => {
    this.setState({ isPlaying: false });
    this.oscil1.stop();
    this.oscil2.stop();
  };

  handleNoteChange = (val) => {
    if (this.notes[val].label !== this.state.note) {
      this.setState({ note: this.notes[val].label });
      this.updateOscillators();
    }
  };

  notes = [
    { value: 0, label: "C", freq: 65.406 },
    { value: 1, label: "D", freq: 73.416 },
    { value: 2, label: "E", freq: 82.407 },
    { value: 3, label: "F", freq: 87.307 },
    { value: 4, label: "G", freq: 97.999 },
    { value: 5, label: "A", freq: 110.0 },
    { value: 6, label: "B", freq: 123.471 },
  ];

  componentDidMount() {
    this.interval = setInterval(
      () => this.setState({ waveform: this.state.waveform }),
      20
    );
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <Container maxWidth="sm" className="container">
        <Grid container direction="row" justify="center" spacing={3}>
          <Grid item xs={12}>
            <h1>Synth</h1>
          </Grid>
          <Grid item xs={12}>
            <Slider
              defaultValue={0}
              aria-labelledby="discrete-slider"
              valueLabelDisplay="off"
              step={1}
              marks={this.notes}
              max={this.notes.length - 1}
              onChangeCommitted={(e, val) => this.handleNoteChange(val)}
            />
          </Grid>
          <Synthie ref={this.osc1} onChange={this.updateOscillators} />
          <Synthie ref={this.osc2} onChange={this.updateOscillators} />
          <Grid item xs={12}>
            <Button
              variant="contained"
              color={this.state.isPlaying ? "secondary" : "primary"}
              size="large"
              startIcon={
                !this.state.isPlaying ? <PlayArrowIcon /> : <PauseIcon />
              }
              onClick={!this.state.isPlaying ? this.playSound : this.stopSound}
            >
              {!this.state.isPlaying ? "Play" : "Pause"}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Canvas waveform={this.state.waveform.getValue()} />
          </Grid>
        </Grid>
      </Container>
    );
  }
}

class Synthie extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      octave: 4,
      oscType: "sine",
      detune: 0,
      volume: -6,
    };
  }

  handleChangeOctave = (up) => {
    this.setState({
      octave: up ? this.state.octave + 1 : this.state.octave - 1,
    });
    this.props.onChange();
  };

  handleChangeType = (e) => {
    this.setState({ oscType: e.target.value });
    this.props.onChange();
  };

  handleChangeDetune = (e, val) => {
    this.setState({ detune: val });
    this.props.onChange();
  };

  handleChangeVolume = (e, val) => {
    this.setState({ volume: val });
    this.props.onChange();
  };

  render() {
    return (
      <>
        <Grid item xs={3}>
          <p className="mod-title">Octave</p>
          <IconButton
            aria-label="-1"
            onClick={() => this.handleChangeOctave(false)}
            disabled={this.state.octave < 3}
          >
            <RemoveIcon fontSize="inherit" />
          </IconButton>
          <span>{this.state.octave}</span>
          <IconButton
            aria-label="+1"
            onClick={() => this.handleChangeOctave(true)}
            disabled={this.state.octave > 5}
          >
            <AddIcon fontSize="inherit" />
          </IconButton>
        </Grid>
        <Grid item xs={3}>
          <p className="mod-title">Type</p>
          <Select
            native
            value={this.state.oscType}
            onChange={this.handleChangeType}
          >
            <option value={"sine"}>Sine</option>
            <option value={"triangle"}>Triangle</option>
            <option value={"square"}>Square</option>
            <option value={"sawtooth"}>Sawtooth</option>
          </Select>
        </Grid>
        <Grid item xs={3}>
          <p className="mod-title">Detune</p>
          <Slider
            value={this.state.detune}
            onChange={this.handleChangeDetune}
            min={-100}
            max={100}
            valueLabelDisplay="auto"
          />
          <p>{this.state.detune} Cents</p>
        </Grid>
        <Grid item xs={3}>
          <p className="mod-title">Volume</p>
          <Slider
            value={this.state.volume}
            onChange={this.handleChangeVolume}
            min={-24}
            max={0}
            aria-labelledby="continuous-slider"
            valueLabelDisplay="auto"
          />
          <p>{this.state.volume} dB</p>
        </Grid>
      </>
    );
  }
}

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.waveform = props.waveform;
    this.myRef = React.createRef();
  }

  componentDidMount() {
    let myP5 = new p5(this.sketch, this.myRef.current);
  }

  sketch = (p) => {
    p.setup = () => {
      p.createCanvas(document.getElementById("p5c").clientWidth, 200);
    };

    p.draw = () => {
      p.background(255);
      this.waveform.forEach((el, index) => {
        p.fill(33, 150, 243);
        p.noStroke();
        p.rect(
          index * (p.width / this.waveform.length),
          100,
          2,
          el * (p.height / 2)
        );
      });
    };

    p.windowResized = () => {
      p.resizeCanvas(document.getElementById("p5c").clientWidth, 200);
    };
  };

  render() {
    return <div id="p5c" ref={this.myRef} />;
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
