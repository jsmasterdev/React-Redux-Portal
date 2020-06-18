import React, {Component} from 'react'
import { Modal, Button, Form, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import { trls } from '../../components/translate';
import "react-datepicker/dist/react-datepicker.css";
import * as Common from '../../components/common';
import DraggableModalDialog from '../../components/draggablemodal';

const mapStateToProps = state => ({ 
    ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({

});

class Addtransporter extends Component {
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
    }

    onHide = () => {
        this.props.onHide();
        this.props.getSalesOrderLine();
    }

    changeTransportCode = (transporterCode) => {
        let transportArray = this.props.transportResult;
        transportArray.map((transport, index)=>{
            if(transport.TransporterCode===transporterCode){
                if(transport.checked){
                    transport.checked = false
                }else{
                    transport.checked = true
                }
            }
            return transport;
        });
        this.setState({transportSavingData: transportArray});
    }

    postTransport = () => {
        console.log('221323123', this.props.transportdata)
        let transportArray = this.state.transportSavingData;
        let params = [];
        var headers = SessionManager.shared().getAuthorizationHeader();
        if(transportArray){
            transportArray.map((transport, index)=>{
                if(transport.checked){
                    params = {
                        orderid: this.props.orderid,
                        salesorderlineid: this.props.transportdata.salesOrderLineId,
                        transportercode: transport.TransporterCode,
                        pricingtype: transport.pricingtype,
                        price: transport.price,
                        packingslip: this.props.transportdata.packingslip,
                        container: this.props.transportdata.container,
                        shipping: this.props.transportdata.shippingdocumentnumber
                    }
                    Axios.post(API.PostTransports, params, headers)
                    .then(result => {
                        this.onHide();
                    });
                }
                return transport;
            });
        }else{
            this.onHide();
        }
        
    }

    render(){
        let transportResult = [];
        let transportData = []
        if(this.props.transportResult){
            transportResult = this.props.transportResult;
        }
        if(this.props.transportdata){
            transportData = this.props.transportdata;
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
                    {trls('Transport')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="container product-form" onSubmit = { this.handleSubmit }>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <div className="table-responsive">
                            <table id="example" className="place-and-orders__table table table--striped prurprice-dataTable" width="100%">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>{trls("TransporterCode")}</th>
                                        <th>{trls("TransporterName")}</th>
                                        <th>{trls("Pricingtype")}</th>
                                        <th>{trls("Price")}</th>
                                        <th>{trls("Packing_slip_number")}</th>
                                        <th>{trls("Container_number")}</th>
                                        <th>{trls("ShippingDocumentnumber")}</th>
                                    </tr>
                                </thead>
                                {transportResult && (<tbody>
                                    {
                                        transportResult.map((data,i) =>(
                                        <tr id={data.id} key={i}>
                                            <td><input type="checkbox" onChange={()=>this.changeTransportCode(data.TransporterCode)} /></td>
                                            <td>{data.TransporterCode}</td>
                                            <td>{data.TransporterName}</td>
                                            <td>{data.pricingtype}</td>
                                            <td>{Common.formatMoney(data.price)}</td>
                                            <td>{transportData.packingslip}</td>
                                            <td>{transportData.container}</td>
                                            <td>{transportData.shippingdocumentnumber}</td>
                                        </tr>
                                    ))
                                    }
                                </tbody>)}
                            </table>
                        </div>  
                    </Form.Group>
                    <Form.Group style={{textAlign:"center"}}>
                        <Button style={{width:"100px"}} onClick={()=>this.postTransport()}>{trls('Save')}</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
            </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Addtransporter);