import React, {Component} from 'react'
import { Modal} from 'react-bootstrap';
import { connect } from 'react-redux';
import { trls } from '../components/translate';

const mapStateToProps = state => ({ 
    ...state,
});

const mapDispatchToProps = (dispatch) => ({
});
class Customernote  extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
        };
    }
    render(){
        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                size="md"
                className="note-modal"
                aria-labelledby="example-modal-sizes-title-sm"
                centered
            >
                <Modal.Header style={{fontWeight:'bold', backgroundColor:"#C0E2F7", borderBottom: "1px solid #4983bd"}} closeButton>
                    <div style={{paddingTop:5}}>
                        <i className="fas fa-exclamation-circle" style={{marginTop:"3px", paddingRight:10}}></i>{trls('Customer_Note')}
                    </div>
                    
                </Modal.Header>
                <Modal.Body style={{backgroundColor:"#C0E2F7", fontSize:15, color:"#0606F8"}}>
                    <div>{this.props.customerNote}</div>
                </Modal.Body>
            </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Customernote);