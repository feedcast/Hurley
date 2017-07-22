import React, { Component } from 'react'
import './../styles/FeedcastLoader.sass'

export default class FeedcastLoader extends Component {
  render(){
    return (
      <div className="feedcast__loader">
          <div className="feedcast__loader--top"></div>
          <div className="feedcast__loader--middle"></div>
          <div className="feedcast__loader--bottom"></div>
      </div>
    )
  }
}
