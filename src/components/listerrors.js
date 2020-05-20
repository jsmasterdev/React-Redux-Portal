import React from 'react';
import FlashMassage from 'react-flash-message'

class ListErrors extends React.Component {
  
  render() {
    const errors = this.props.errors;
    if (errors) {
      return (
          <FlashMassage duration={3000}>
            <div className="alert alert-danger" style={{marginTop:10}}>
              <strong><i className="fas fa-exclamation-triangle"></i>{errors}</strong>
            </div>
          </FlashMassage>
      );
    } else {
      return null;
    }
  }
}
export default ListErrors;
