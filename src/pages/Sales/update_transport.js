import React, {Component} from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import { trls } from '../../components/translate';
import "react-datepicker/dist/react-datepicker.css";
import DraggableModalDialog from '../../components/draggablemodal';

const mapStateToProps = state => ({ 
    ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({

});

class Updatetransport extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            reportingDate: new Date(),
            reportingFlag: false
        };
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    
    componentDidMount() {
        // this.getProductList();
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const clientFormData = new FormData(event.target);
        const data = {};
        let params = [];
        for (let key of clientFormData.keys()) {
            data[key] = clientFormData.get(key);
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        params = {
            id: this.props.updatedata.id,
            packing: data.packingslip,
            container: data.container,
            shipping: data.shippingdocumentnumber
        }
        Axios.post(API.PutTransports, params, headers)
        .then(result => {
            this.onHide();
        });
    }

    onHide = () => {
        this.props.onHide();
        this.props.getSalesOrderLine();
    }

    render(){
        let updateData = [];
        if(this.props.updatedata){
            updateData = this.props.updatedata;
        }
        return (
            <Modal
                show={this.props.show}
                dialogAs={DraggableModalDialog}
                onHide={()=>this.onHide()}
                size="xl"
                aria-labelledby="contained-modal-title-vcenter"
                backdrop= "static"
                centered
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {trls('Edit')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="container product-form" onSubmit = { this.handleSubmit }>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls("Packing_slip_number")}  
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Form.Control type="text" name="packingslip" defaultValue={updateData.packingslip}  placeholder={trls("Packing_slip_number")} />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls("Container_number")}  
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Form.Control type="text" name="container" defaultValue={updateData.container} placeholder={trls("Container_number")} />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls("ShippingDocumentnumber")}  
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Form.Control type="text" name="shippingdocumentnumber" defaultValue={updateData.shipping} placeholder={trls("ShippingDocumentnumber")} />
                        </Col>
                    </Form.Group>
                    <Form.Group style={{textAlign:"center"}}>
                        <Button type="submit" style={{width:"100px"}}>{trls('Save')}</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
            </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Updatetransport);