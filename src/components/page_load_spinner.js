import React from 'react';
import Loader from 'react-loader-spinner'
import { connect } from 'react-redux';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({

});

class Pageloadspinner extends React.Component {
  render() {
    const loading = this.props.loading;
    if (loading) {
      return (
        <Loader
            className="page-loading-spinner"
            type="Puff"
            color="#00BFFF"
            height={50}
            width={50}
          />
      );
    } else {
      return null;
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Pageloadspinner);
