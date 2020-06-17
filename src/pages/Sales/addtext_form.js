import React, {Component} from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { trls } from '../../components/translate';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';

const mapStateToProps = state => ({ 
    ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({

});

class Addtextform extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
        };
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    
    componentDidMount() {
    }

    handleSubmit = (event) => {
        this._isMounted = true;
        event.preventDefault();
        const clientFormData = new FormData(event.target);
        const data = {};
        for (let key of clientFormData.keys()) {
            data[key] = clientFormData.get(key);
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        let params = [];
        if(this.props.updateData.length===0) {
            params = {
                text: data.text,
                salesorderheaderid: this.props.salesId
            }
            Axios.post(API.PostTextLines, params, headers)
            .then(result => { 
                if(this._isMounted){
                    this.props.onHide();
                    this.props.getPurchaseTextLines();
                }
            })
        } else {
            params = {
                id: this.props.updateData.id,
                text: data.text
            }
            Axios.post(API.PutTextLine, params, headers)
            .then(result => { 
                if(this._isMounted){
                    this.props.onHide();
                    this.props.getPurchaseTextLines();
                }
            })
        }
        
    }

    render(){
        const { updateData } = this.props;
        return (
            <Modal
                show={this.props.show}
                onHide={()=>this.props.onHide()}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                backdrop= "static"
                centered
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {trls('Add Text')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit = { this.handleSubmit }>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control as="textarea" rows="3" name="text" required defaultValue={updateData ? updateData.description : ''} placeholder={trls('Text')}/>
                            <label className="placeholder-label">{trls('Text')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group style={{textAlign:"center"}}>
                        <Button type="Submit" style={{width: "10%"}}>{trls("Save")}</Button>
                    </Form.Group>
                </Form>    
            </Modal.Body>
            </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Addtextform);