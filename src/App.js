import './styles/Template.css';
import './styles/markdown-styling.css'
import React from 'react';
import axios from 'axios';
import toolKit from './pocket-knives/export'
import Template from './Template'
const archive = process.env.REACT_APP_GIT_USER_REPO
const titlePage = process.env.REACT_APP_GIT_ARCHIVE_TITLEPAGE

const md = require('markdown-it')();
const junk = [" ","📚","/","root"]

class App extends React.Component{/*
--------------------------


    Model


--------------------------
*/
  constructor(){
    super()
    this.state = {
      contents: [],
      currentPage: titlePage,
      searchField: "",
      directory: ["root"],
    }
  }

 // 1. Load Table of Contents
  // 2. Load Title Page

  componentDidMount(){
    axios.get(`https://api.github.com/repos/${archive}/contents/`).then(response => {

      this.setState ({
          contents: toolKit.Markdown.returnMarkdownFiles(response.data) 
      })
    }) // 1.


    axios.get(`https://raw.githubusercontent.com/${archive}/master/${titlePage}`).then((response) => {
      let html = md.render(response.data)
      document.getElementById("main").innerHTML = toolKit.Markdown.cleanBeforeRender(html)
                                                  toolKit.Images.loadEmbeddedImages(archive)   
    }) // 2.
  }

  /*-------------------------


    Controller


  ---------------------------
  */
  
  nextPage = (e) => {
    if (e.target.innerHTML.includes("📚")) 
    {
      this.nextDirectory(e)
      return
    }

    let path = this.state.directory.filter(dir => dir !== "root").join("");
    let nextPage = e.target.innerHTML
    let request = axios.get(`https://raw.githubusercontent.com/${archive}/master/${path}/${nextPage}`)

    request.then((response) => {
      let html = md.render(response.data);
      
      document.getElementById("right").scrollTop = 0 // Set window @ top of next page
      
      document.getElementById("main").innerHTML = toolKit.Markdown.cleanBeforeRender(html)
                                                  toolKit.Images.loadEmbeddedImages(archive)
    })

      this.setState({currentPage: nextPage})
  }

  nextDirectory = (e) => {
    let directory = e.target.innerHTML
    .replace("📚","")
    .replace(" ","")
    .replace("/","")
    .replace("root","")

    if (directory === ""){
        this.setState({
          directory: ["root"],
          path: ""
        })
    } // base case

    axios.get(`https://api.github.com/repos/${archive}/contents/${directory}`).then(response => {
        this.setState ({
            contents: toolKit.Markdown.returnMarkdownFiles(response.data),
        })

        if (this.state.directory.includes(directory) === false){
          this.state.directory.push(directory) 
        }
        console.log(this.state.directory)
    })
  }
  

  changeDirectory = (e) => {
    let directory = e.target.innerHTML.replace("/","")

    if (directory === "root"){
      this.nextDirectory("")
      return
    }
  }

  searchChange = (e) => {
    let input = e.target.value
    this.setState({ searchField: input})
  } /* ----------------------
  
  
    View
  
  
  --------------------------
*/

  render(){
    let keywords = this.state.searchField.split(" ")
    let filteredContents = this.state.contents.filter(c => {
      for (var i = 0; i < keywords.length; ++i){
        if (c.toLowerCase().includes(keywords[i])){
          return true
        }
      }
      return false
    })

    return (
      <>
        <Template 
        currentPage={this.state.currentPage} 
        directory={this.state.directory}
        contents={filteredContents} 
        nextPage={this.nextPage}
        searchChange={this.searchChange}
        nextDirectory={this.nextDirectory}
        />
      </>
    )
  }
}
export default App
