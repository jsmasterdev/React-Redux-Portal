import React from 'react';
import FileDrop from 'react-file-drop';

class ReactFileDropDemo extends React.Component {
  handleDrop = (files, event) => {
    console.log(files, event);
  }

  render() {
    // const styles = { border: '1px solid black', width: 600, color: 'black', padding: 20 };
    return (
      <div id="react-file-drop-demo" style={{border: '1px solid black', width: 600, color: 'black', padding: 20 }}>
        <FileDrop onDrop={this.handleDrop}>
          Drop some files here!
        </FileDrop>
      </div>
    );
  }
}

export default ReactFileDropDemo;
    