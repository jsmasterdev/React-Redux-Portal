
import React, {Component} from 'react'
import { Form, Row, Col} from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { trls } from '../../components/translate';
import Select from 'react-select';
import { connect } from 'react-redux';
import 'datatables.net';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import * as Common from '../../components/common';
import Customernote from '../../components/customer_note';
import * as authAction  from '../../actions/authAction';

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
  blankDispatch: () =>
        dispatch(authAction.blankdispatch()),
});

class Productform extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            token: "",
            customerData: [],
            Supplier: [],
            Producttype: [],
            Customer: [],
            Salesunit: [],
            Productgroup: [],
            Purchase_unit: [],
            modalShow: false,
            val1:"",
            val2:"",
            val3:"",
            val4:"",
            val5:"",
            val6:"",
            redirect:false,
            product_id:"",
            loading:true,
            description: '',
            CustomerCode: ''
        };
    }
  
    componentDidMount() {
    }

    componentWillUnmount() {
        this._isMounted = false;
    }
  
    handleSubmit = (event) => {
        event.preventDefault();
        const clientFormData = new FormData(event.target);
        const data = {};
        for (let key of clientFormData.keys()) {
            data[key] = clientFormData.get(key);
        }
        let params = {
            "supplier":data.Supplier,
            "producttype":data.Producttype,
            "Concentration":data.Concentration,
            "addition": data.Addition,
            "customer": data.Customer,
            "description": data.Description,
            "salesunit": data.Salesunit,
            "productgroup": data.Productgroup,
            "kilogram":data.kilogram,
            "purchaseunit":data.purchase_unit,
            "approver": data.approver,
            "product": data.product
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.PostProductData, params, headers)
        .then(response => {
        if(response.data.Success===true){
            Common.hideSlideForm();
            this.props.onHide();
            this.setState({product_id:response.data.NewId});
            this.props.onShowProductDetail(response.data.NewId);
            }
        });
    }
  
    selectCustomer = (val) =>{
        this.setState({val3: val.value});
        let tempArray = [];
        tempArray = this.props.customer;
        tempArray.map((data, index) => {
            if(data.key===val.value){
                if(data.note){
                this.setState({noteModalShow: true})
                }
                this.setState({customerNote:data.note})
            }
            return tempArray;
        })
    }
  
    changeSupplier = (value) => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        let params = {
            supplier: value
        }
        Axios.post(API.GetPurchaseDescription, params, headers)
        .then(result => {
            if(result.data.Items[0]){
                this.setState({description: result.data.Items[0].description})
            }
            this.setState({val1: value})
        });
    }

    onHide = () => {
        this.props.onHide();
        Common.hideSlideForm();
    }
  
    render(){
        let purchase_unit=[];
        let approver = [];
        const supplier = this.props.supplier.map( s => ({value:s.key,label:s.value}) );
        const customer  = this.props.customer.map( s => ({value:s.key,label:s.value}) );
        const salesunit  = this.props.salesunit.map( s => ({value:s.key,label:s.value}) );
        const productgroup = this.props.productgroup.map( s => ({value:s.key,label:s.value}) );
        if(this.props.purchase_unit){
            purchase_unit = this.props.purchase_unit.map( s => ({value:s.key,label:s.value}) );
        }
        if(this.props.approver){
            approver = this.props.approver.map( s => ({value:s.key,label:s.value}) );
        }
        let copyProduct = this.props.copyproduct;
        return (
            <div className = "slide-form__controls open" style={{height: "100%"}}>
                <div style={{marginBottom:30}}>
                    <i className="fas fa-times slide-close" style={{ fontSize: 20, cursor: 'pointer'}} onClick={()=>this.onHide()}></i>
                </div>
                <Form className="container" onSubmit = { this.handleSubmit }>
                    <Col className="title add-product">{trls('Add_Product')}</Col>
                    <Form.Group className={this.props.copyflag!==1 ? "product-text" : ''} as={Row} controlId="formPlaintextSupplier">
                        <Col>
                            <Select
                                name="Supplier"
                                placeholder={trls('Supplier')}
                                options={supplier}
                                onChange={val => this.changeSupplier(val.value)}
                                defaultValue={copyProduct.defaultSupplier}
                            />
                            <label className="placeholder-label">{trls('Supplier')}</label>
                            {!this.props.disabled && this.props.copyflag!==0 && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0, width: '100%' }}
                                    value={this.state.val1}
                                    required
                                    />
                                )}
                        </Col>
                    </Form.Group>
                    <Form.Group className={this.props.copyflag!==1 ? "product-text" : ''} as={Row} controlId="formPlaintextPassword">
                        <Col>
                            <Select
                                name="Customer"
                                placeholder={trls('Customer')}
                                options={customer}
                                onChange={val => this.selectCustomer(val)}
                                defaultValue={copyProduct.defaultCustomer}
                            />
                            <label className="placeholder-label">{trls('Customer')}</label>
                            {!this.props.disabled && this.props.copyflag!==0 && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0, width: '100%' }}
                                    value={this.state.val3}
                                    required
                                    />
                                )}
                        </Col>
                    </Form.Group>
                    <Form.Group className={this.props.copyflag!==1 ? "product-text" : ''} as={Row} controlId="formPlaintextPassword">
                        <Col>
                            <Form.Control type="text" name="product"  defaultValue={copyProduct.Product} placeholder={trls('Product')} />
                            <label className="placeholder-label">{trls('Product')}</label>
                            {!this.props.disabled && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0 }}
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col>
                            <label className="placeholder-label">{trls('Description')}</label>
                            <Form.Control type="text" defaultValue={copyProduct.Description ? copyProduct.Description  : this.state.description} name="Description" placeholder={trls('Description')} />
                            <label className="placeholder-label">{trls('Description')}</label>
                            {!this.props.disabled && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0 }}
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group className={this.props.copyflag!==1 ? "product-text" : ''} as={Row} controlId="formPlaintextPassword">
                        <Col>
                            <Select
                                name="Salesunit"
                                placeholder={trls('Salesunit')}
                                options={salesunit}
                                onChange={val =>this.setState({val4:val})}
                                defaultValue={copyProduct.defaultSalesUnit}
                            />
                            <label className="placeholder-label">{trls('Salesunit')}</label>
                            {!this.props.disabled && this.props.copyflag!==0 && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0, width: '100%' }}
                                    value={this.state.val4}
                                    required
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group className={this.props.copyflag!==1 ? "product-text" : ''} as={Row} controlId="formPlaintextPassword">
                        <Col>
                            <Select
                                name="Productgroup"
                                placeholder={trls('Product_Group')}
                                options={productgroup}
                                onChange={val => this.setState({val5:val})}
                                defaultValue={copyProduct.defaultProductgroup}
                            />
                            <label className="placeholder-label">{trls('Product_Group')}</label>
                            {!this.props.disabled && this.props.copyflag!==0 &&(
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0, width: '100%' }}
                                    value={this.state.val5}
                                    required
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group className={this.props.copyflag!==1 ? "product-text" : ''} as={Row} controlId="formPlaintextPassword">
                        <Col>
                            <Select
                                name="purchase_unit"
                                placeholder={trls('Purchase_Unit')}
                                options={purchase_unit}
                                onChange={val => this.setState({val5:val})}
                                defaultValue={copyProduct.defaultPurchaseUnit}
                            />
                            <label className="placeholder-label">{trls('Purchase_Unit')}</label>
                            {!this.props.disabled && this.props.copyflag!==0 && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0, width: '100%' }}
                                    value={this.state.val5}
                                    required
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group className={this.props.copyflag!==1 ? "product-text" : ''} as={Row} controlId="formPlaintextPassword">
                        <Col>
                            <Select
                                name="approver"
                                placeholder={trls('Approver')}
                                options={approver}
                                onChange={val => this.setState({val5:val})}
                                defaultValue={copyProduct.defaultApprove}
                            />
                            <label className="placeholder-label">{trls('Approver')}</label>
                            {!this.props.disabled && this.props.copyflag!==0 && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0, width: '100%' }}
                                    value={this.state.val5}
                                    required
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control type="number" name="kilogram" placeholder={trls('Kilogram')} defaultValue={copyProduct.Kilogram} onChange={val=>this.setState({val6:val})}/>
                            <label className="placeholder-label">{trls('Kilogram')}</label>
                            {!this.props.disabled && this.props.copyflag!==0&& (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0, width: '100%' }}
                                    value={this.state.val6}
                                    required
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group >
                        <Col>
                            <Button type="submit" style={{width:"100px"}}>Save</Button>
                        </Col>
                    </Form.Group>
                    <Form.Control type="text" hidden name="token" defaultValue={this.props.token} />
                    <Customernote
                        show={this.state.noteModalShow}
                        onHide={() => this.setState({noteModalShow: false})}
                        customerNote={this.state.customerNote}
                    />
                </Form>
            </div>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Productform);