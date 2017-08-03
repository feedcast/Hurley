import React, { Component } from 'react'
import feedcastApi from './../scripts/feedcastApi'
import helpers from './../scripts/helpers'
import './../styles/PlayerFooter.sass'


class PlayerFooter extends Component {
  constructor(props) {
    super(props);

    this.audioPlayer = document.createElement('AUDIO')

    this.state = {
      episodes : [],
      playingUuid : null,
      isPaused: this.audioPlayer.paused,
      canPlay: false,
      loadedData: false,
      duration: '00:00:00',
      currentTime:'00:00:00',
      title:'',
      playbackRate: 1
    }


    this.bindEvents()
  }



  bindEvents(){
    feedcastApi.on('play:episode', this.playEpisode.bind(this))

    const t = 'AUDIOPLAYER'

    //Player changing state
    this.audioPlayer.onplay = e => {
        console.log(`${t} - ${e.type}:`, e);
        this.setState({isPaused: false})
    }
    this.audioPlayer.onpause = e => {
        console.log(`${t} - ${e.type}:`, e);
        this.setState({isPaused: true})
    }
    this.audioPlayer.oncanplay = e => {
        console.log(`${t} - ${e.type}:`, e);
        this.setState({canPlay: true})
    }
    this.audioPlayer.onloadeddata = e => {
        console.log(`${t} - ${e.type}:`, e);
        this.setState({loadedData: true})
        console.log('duration', this.audioPlayer.duration)
    }

    this.audioPlayer.ontimeupdate = e => {
      this.setState({
        duration: helpers.secondsToHms(this.audioPlayer.duration),
        currentTime: helpers.secondsToHms(this.audioPlayer.currentTime)
      })
    }

    //ERROR HANDLING
    const err = {
      canPlay: false,
      isPaused: true,
      loadedData: false
    }

    this.audioPlayer.onabort = e => {
        console.log(`${t} - ${e.type}:`, e);
        this.setState(err)
    }
    this.audioPlayer.onerror = e => {
        console.log(`${t} - ${e.type}:`, e);
        this.setState(err)
    }
  }



  playEpisode(episode){
    let episodes = this.state.episodes
    episodes[episode.uuid] = episode

    this.setState({ episodes, playingUuid: episode.uuid, title: episode.title })


    this.audioPlayer.src = episode.audio.url

    this.changeRate(1)

    this.audioPlayer.play()
  }


  forwardTime(){
    this.audioPlayer.currentTime += 15
  }

  backwardTime(){
    this.audioPlayer.currentTime -= 15
  }

  changeRate(val){
    let {playbackRate : r } = this.state
    let newRate = r >= 2? 1 : r+.5

    if(typeof val !== 'undefined')
      newRate = val

    this.setState({
      playbackRate: newRate
    });

    this.audioPlayer.playbackRate = newRate
  }

  getPerc(){
    let {duration, currentTime} = this.audioPlayer
    return ( currentTime * 100 ) / duration
  }


  handleTimeClick(event){
    if(!this.state.canPlay)
      return false;

    let { clientX : x } = event
    let { left : min , width : total } = event.target.getBoundingClientRect()

    x = x - min

    //Percent where user has clicked
    let percent = parseInt((x * 100) / total)

    let { duration } = this.audioPlayer

    this.audioPlayer.currentTime =  (percent * duration) / 100
  }

  webPlayer(){

    const {episodes, playingUuid} = this.state
    const currentEpisode = episodes[playingUuid]

    return (
      <div className={`feedcast__footer feedcast__footer--${playingUuid !== null ? 'show':'hide'}`}>
        <div className="feedcast__playerFooter">
          <div className="feedcast__playerFooter-top">
            <h5>{this.state.title}</h5>
          </div>
          <div className="feedcast__playerFooter-bottom">
            <button
              className="feedcast__player-backward"
              onClick={e=>{this.backwardTime()}}>
              <i className="fa fa-backward"></i>
            </button>
            <button
              className="feedcast__player-play-pause"
              onClick={e=>{this.audioPlayer[`${this.state.isPaused?'play':'pause'}`]()}}>
              {this.state.loadedData === false ? (
                <i className="fa fa-spinner fa-pulse fa-fw"></i>
              ):(
                <i className={`fa fa-${this.state.isPaused?'play':'pause'}`}></i>
              )}
            </button>
            <button
              className="feedcast__player-forward"
              onClick={e=>{this.forwardTime()}}>
              <i className="fa fa-forward"></i>
            </button>
            <div
              className="feedcast__player-time"
              onClick={ e => { this.handleTimeClick(e)} }>
              <div
                style={{
                  width: `${this.getPerc()}%`
                }}
                className="feedcast__player-time-bar">
              </div>
              <span>{`${this.state.currentTime} / ${this.state.duration}`}</span>
            </div>
            <a href={this.audioPlayer.src} download>
            <button className="feedcast__player-download">
              <i className="fa fa-download"></i>
            </button>
            </a>
            <button
              className="feedcast__player-playback-rate"
              onClick={ e => this.changeRate() }>
              {parseFloat(this.state.playbackRate).toFixed(1)}x
            </button>
          </div>
        </div>
      </div>
    )
  }



  render(){
    return this.webPlayer()
  }
}


export default PlayerFooter
