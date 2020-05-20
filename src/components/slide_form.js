import React, {Component} from 'react'
import { Modal} from 'react-bootstrap';
import { connect } from 'react-redux';
import { trls } from './translate';

const mapStateToProps = state => ({ 
    ...state,
});

const mapDispatchToProps = (dispatch) => ({
});

class Slideform  extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
        };
    }
    render(){
        return (
            <div className="header__controls">
                1111111
            </div>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Slideform);