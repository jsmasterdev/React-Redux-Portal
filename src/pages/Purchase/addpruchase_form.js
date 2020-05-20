import React, {Component} from 'react'
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import { trls } from '../../components/translate';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import DraggableModalDialog from '../../components/draggablemodal';
import * as Common from '../../components/common'
import Sweetalert from 'sweetalert';

const mapStateToProps = state => ({ 
    ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({

});

class Addpurchase extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            filsterList: [{"value": "1", "label": "Packing slip"}, {"value": "2", "label": "Containernumber"}, {"value": "3", "label": "Shippingdocument "}],
            nlfilsterList: [{"value": "1", "label": "Pakbon nummer"}, {"value": "2", "label": "Container nummer"}, {"value": "3", "label": "Vrachtbrief nummer"}],
            quantity: '',
            filterValue: '',
            productData: [],
            checkedData: [],
            vatCodeList: [],
            searchFlag: false,
            priceEditFlag: false
        };
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    
    componentDidMount() {
        this.getProductList();
    }

    handleSubmit = (event) => {
        this.setState({searchFlag: true})
        event.preventDefault();
        const clientFormData = new FormData(event.target);
        const data = {};
        let params = [];
        let URL = '';
        for (let key of clientFormData.keys()) {
            data[key] = clientFormData.get(key);
        }
       
        var headers = SessionManager.shared().getAuthorizationHeader();
        if(data.filter==="1"){
            params = {
                supplier: this.props.suppliercode,
                number: data.number
            }
            if(!this.props.transport){
                URL = API.GetOrderLinesByPacking;
            }else{
                URL = API.GetTransportLinesByPacking;
            }
            Axios.post(URL, params, headers)
            .then(result => {
                if(this._isMounted){
                    this.setState({searchFlag: false, productData: result.data.Items})
                }
            });
        }else if(data.filter==="2"){
            params = {
                supplier: this.props.suppliercode,
                number: data.number
            }
            if(!this.props.transport){
                URL = API.GetOrderLinesByContainer;
            }else{
                URL = API.GetTransportLinesByContainer;
            }
            Axios.post(URL, params, headers)
            .then(result => {
                if(this._isMounted){
                    this.setState({searchFlag: false, productData: result.data.Items})
                }
            });
        }else if(data.filter==="3"){
            params = {
                supplier: this.props.suppliercode,
                number: data.number
            }
            if(!this.props.transport){
                URL = API.GetOrderLinesByShipping;
            }else{
                URL = API.GetTransportLinesByShipping;
            }
            Axios.post(URL, params, headers)
            .then(result => {
                if(this._isMounted){
                    this.setState({searchFlag: false, productData: result.data.Items})
                }
            });
        }
    }

    getProductList = () =>{
        this._isMounted = true;
        var headers = SessionManager.shared().getAuthorizationHeader();
        var params = {
            customercode: this.props.customercode,
            suppliercode: this.props.suppliercode
        }
        Axios.post(API.GetSalesItems, params, headers)
        .then(result => {
            if(this._isMounted){
                let product = result.data.Items.map( s => ({value:s.key,label:s.value}));
                this.setState({productListData: product});
            }
        });
    }

    getVatcodeList = () =>{
        this._isMounted = true;
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetVATCode, headers)
        .then(result => {
            if(this._isMounted){
                let vatCode = result.data.Items.map( s => ({value:s.key,label:s.value}));
                this.setState({vatCodeList: vatCode})
            }
        });
    }

    changeProductId = (id) => {
        this.setState({priceEditFlag: false})
        let productArray = this.state.productData;
        productArray.map((product, index)=>{
            if(product.id===id){
                if(product.checked){
                    product.checked = false
                }else{
                    product.checked = true
                }
            }
            return productArray;
        });
        this.setState({productData: productArray});
    }

    setVatCode = (id, code) => {
        let productArray = this.state.productData;
        productArray.map((product, index)=>{
            if(product.id===id){
                product.vatCode = code
            }
            return productArray;
        });
        this.setState({productData: productArray});
    }

    postPurchaseLines = () => {
        let product = this.state.productData;
        let params = [];
        let k=0;
        var headers = SessionManager.shared().getAuthorizationHeader();
        let checkedProductLength = product.filter(item => item.checked === true).length;
        if(!this.props.transport){
            product.map((product, index)=>{
                if(product.checked){
                    k++;
                    params = {
                        purchaseid: this.props.purchaseid,
                        id: product.id,
                        vatid: product.vatCode ? product.vatCode : Number(this.props.defaultVatCode[0].value)
                    }
                    Axios.post(API.PostPurchaseOrderLine, params, headers)
                    .then(result => {
                        params ={ 
                            purchaseid: this.props.purchaseid,
                            id: result.data.NewId
                        }
                        Axios.post(API.CheckMultipleLines, params, headers)
                        .then(result => {

                            if(result.data.Items[0].multiplelines==="true"){
                                Sweetalert(trls('already_purchaseinvoice'));
                            }
                            // 
                            // Axios.post(API.PutTransportPurchaseId , params, headers)
                            // .then(result => {
                            //     if(k===checkedProductLength){
                            //         this.onHide();
                            //     }
                            // });
                            if(k===checkedProductLength){
                                this.onHide();
                            }
                        });
                    });
                }
                return product;
            });
        }else{
            product.map((product, index)=>{
                if(product.checked){
                    k++;
                    params = {
                        purchaseid: this.props.purchaseid,
                        id: product.id,
                        vatid: product.vatCode ? product.vatCode : Number(this.props.defaultVatCode[0].value)
                    }
                    Axios.post(API.PostPurchaseOrderLineTransport, params, headers)
                    .then(result => {
                        params ={ 
                            purchaseid: this.props.purchaseid,
                            id: result.data.NewId,
                        }
                        Axios.post(API.CheckMultipleLinesTransport, params, headers)
                        .then(result => {

                            if(result.data.Items[0].multiplelines==="true"){
                                Sweetalert(trls('already_purchaseinvoice'));
                            }
                            // 
                            // Axios.post(API.PutTransportPurchaseId , params, headers)
                            // .then(result => {
                            //     if(k===checkedProductLength){
                            //         this.onHide();
                            //     }
                            // });
                            if(k===checkedProductLength){
                                this.onHide();
                            }
                        });
                    });
                }
                
                return product;
            });
        }
    }

    onHide = () => {
        this.setState({
            quantity: 0,
            filterValue: '',
            productData: [],
            checkedData: [],
            priceEditFlag: true
        })
        this.props.onHide();
        this.props.getPurchaseOrderLines();
    }

    onEditPriceChange = (data) => {
        this.setState({priceEditFlag: true})
        let productDatArray = this.state.productData;
        productDatArray.map((value, key) => {
            if(value.id===data.id){
                value.editFlag=true;
            }else{
                value.editFlag=false;
            }
            return data;
        })
        this.setState({productData: productDatArray})
    }

    onChangePrice = (evt) => {
        let productDatArray = this.state.productData;
        let line_id = evt.target.id;
        let line_value = evt.target.value;
        var headers = SessionManager.shared().getAuthorizationHeader();
        let params = {};
        params = {
            orderlineid: line_id,
            newprice: line_value,
        }
        Axios.post(API.UpdateTransportPriceLines, params, headers)
        .then(result => {
            productDatArray.map((value, key) => {
                if(value.id===Number(line_id)){
                    value.price=parseFloat(line_value);
                }
                return value;
            })
        })
        this.setState({productData: productDatArray});
    }

    render(){
        let lang = window.localStorage.getItem('nevema_lang');
        return (
            <Modal
                dialogAs={DraggableModalDialog} 
                show={this.props.show}
                onHide={()=>this.onHide()}
                size="xl"
                aria-labelledby="contained-modal-title-vcenter"
                backdrop= "static"
                centered
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {!this.props.transport?(
                        trls('Purchase')
                    ):trls('Transport')}
                    
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="container product-form" onSubmit = { this.handleSubmit }>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls('Where_do_filter')}
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Select
                                name="filter"
                                options={lang==="nl_BE" ? this.state.nlfilsterList : this.state.filsterList}
                                onChange={val => this.setState({filterValue: val.value})}
                            />
                            {!this.props.disabled && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0 }}
                                    value={this.state.filterValue}
                                    required
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls("Number")}  
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Form.Control type="text" name="number" required defaultValue={this.state.quantity} placeholder={trls("Number")}  />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            {!this.state.searchFlag?(
                                <Button type="submit" style={{width:"100px", float: 'right'}}><i className="fas fa-search"></i> {trls('Search')}</Button>
                            ):
                                <Button type="submit" style={{width:"100px", float: 'right'}}><Spinner animation="border" variant="info" className="search-spinner"/> {trls('Search')}</Button>
                            }
                            
                        </Col>
                    </Form.Group>
                    <Form.Group style={{textAlign:"center"}}>
                        <table id="example" className="place-and-orders__table table table--striped prurprice-dataTable" width="100%">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>{!this.props.transport ? trls('Productcode') : trls('Pricingtype')}</th>
                                    <th style={{width: "25%"}}>{!this.props.transport ? trls('Quantity') : trls('Price')}</th>
                                    {!this.props.transport&&(<th>{trls('Purchase_Unit')}</th>)}
                                    <th>{trls('VATCode')}</th>
                                </tr>
                            </thead>
                            {this.state.productData.length>0 ? (
                                <tbody>
                                {
                                    this.state.productData.map((data,i) =>(
                                    <tr id={data.id} key={i}>
                                        <td style={{verticalAlign: 'top'}}><input type="checkbox" checked={data.checked ? data.checked : false } onChange={()=>this.changeProductId(data.id)}/></td>
                                        <td style={{verticalAlign: 'top'}}>{!this.props.transport ? data.ProductCode :data.pricingtype}</td>
                                        {!this.props.transport?(
                                            <td style={{verticalAlign: 'top'}}>{data.PurchaseQuantity }</td>
                                        ):
                                            <td style={{verticalAlign: 'top'}}>
                                                
                                                {!data.editFlag || !this.state.priceEditFlag ?(
                                                    <span>{Common.formatMoney(data.price)}</span>
                                                ):
                                                    <Form.Control id={data.id} type="text" name="price" style={{width: "50%"}} defaultValue={data.price} placeholder={trls("Number")} onChange = {(evt, data)=>this.onChangePrice(evt, data)}/>
                                                }
                                                {data.editablePrice!=="false" ? (
                                                    <i id={data.Id} style={{marginLeft: 'auto'}} className="fas fa-pen statu-item" disabled onClick={()=>this.onEditPriceChange(data)} ></i>
                                                ):
                                                    null
                                                }
                                            </td>
                                        }
                                        {!this.props.transport&&(<td style={{verticalAlign: 'top'}}>{data.unit}</td>)}
                                        <td style={{verticalAlign: 'top', width: 200, textAlign: 'left'}}>
                                            <Select
                                                name="vat"
                                                placeholder={trls('Supplier')}
                                                options={this.props.vatCodeList}
                                                onChange={val => this.setVatCode(data.id, val.value)}
                                                defaultValue = {this.props.defaultVatCode}
                                            />
                                        </td>
                                    </tr>
                                ))
                                }
                            </tbody>):
                            <tbody>
                                <tr>
                                    {!this.props.transport?(<td colSpan='5' style={{verticalAlign: 'top'}}>{trls('No_Result')}</td>):<td colSpan='4' style={{verticalAlign: 'top'}}>{trls('No_Result')}</td>}
                                </tr>
                            </tbody>}
                        </table>
                    </Form.Group>
                    <Form.Group style={{textAlign:"center"}}>
                        <Button style={{width:"100px"}} onClick={()=>this.postPurchaseLines()}>{trls('Save')}</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
            </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Addpurchase);
    