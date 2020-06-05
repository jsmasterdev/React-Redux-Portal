import React, {Component} from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { connect } from 'react-redux';
import * as salesAction  from '../../actions/salesAction';
import DatePicker from "react-datepicker";
import SessionManager from '../../components/session_manage';
import Customernote from '../../components/customer_note';
import API from '../../components/api'
import Axios from 'axios';
import { trls } from '../../components/translate';
import * as Common from '../../components/common';
import FileDrop from 'react-file-drop';
import $ from 'jquery';
import * as Auth   from '../../components/auth';
import Typeform from './documenttype_form';
import Pageloadspiiner from '../../components/page_load_spinner';

const mapStateToProps = state => ({ 
    ...state,
    customerData: state.common.customerData,
    salesUploadFile: state.common.salesFile

});

const mapDispatchToProps = (dispatch) => ({
    getCustomer: () =>
        dispatch(salesAction.getCustomerData()),
    saveSalesOder: (params) =>
        dispatch(salesAction.saveSalesOrder(params)),
    salesFileBlank: () =>
        dispatch(salesAction.salesFileBlank())
});
class Salesform extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            orderdate: new Date(), 
            arrivalDate: new Date(),
            arrivalDateFlag: false,
            val1: '',
            val2: '',
            val3: '',
            customerNote: '',
            purchaseData: [],
            files: [],
            supplier: [],
            orderid: '',
            arrivaleFlag: false,
            arriFlag: false,
            loadingFlag: false,
            referCustomerFlag: true,
            rederijList: []
        };
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    componentDidMount() {
        this.props.getCustomer();
        this.getPurchaseData();
        this.getSupplierList();
        this.getRederijList();
        this.getDocumentType();
    }

    getPurchaseData () {
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetPurchaseOrderDropdown, headers)
        .then(result => {
            this.setState({purchaseData: result.data.Items})
        });
    }

    getDocumentType () {
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetDocumenttypesDropdown, headers)
        .then(result => {
            this.setState({typeData: result.data.Items});
        });
    }

    getSupplierList = () => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetSuppliersDropdown, headers)
        .then(result => {
            this.setState({supplier: result.data.Items});
        });
    };

    getRederijList = () => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetRederijDropdown, headers)
        .then(result => {
            this.setState({rederijList: result.data.Items});
        });
    };

    handleSubmit = (event) => {
        event.preventDefault();
        const clientFormData = new FormData(event.target);
        const data = {};
        for (let key of clientFormData.keys()) {
            data[key] = clientFormData.get(key);
        }
        var params = [];
        var headers = SessionManager.shared().getAuthorizationHeader();
        if(!this.props.salesOrder){
            params = {
                customer: data.customer,
                supplier: data.supplier,
                reference: data.reference,
                loadingdate: Common.formatDateSecond(data.orderdate),
                arrivaldate: this.state.arrivaleFlag ? Common.formatDateSecond(data.arrivaldate): '',
                comments: data.comments,
                rederij: data.rederij ? data.rederij : '',
                uithaalreferentie: data.uithaalreferentie ? data.uithaalreferentie : ''
            }
            Axios.post(API.PostSalesOrder, params, headers)
            .then(result => {
                this.setState({orderid: result.data.NewId})
                this.fileUploadData(result.data.NewId);
            });
        }else{
            params = {
                id: this.props.salesOrder.id,
                customer: data.customer,
                supplier: data.supplier,
                reference: data.reference,
                loadingdate: Common.formatDateSecond(data.orderdate),
                arrivaldate: Common.formatDateSecond(data.arrivaldate),
                comments: data.comments
                // iscompleted: true
            }
            data.id = this.props.salesOrder.id;
            Axios.post(API.PutSalesOrder, params, headers)
            .then(result => {
                this.fileUploadData(this.props.salesOrder.id);
            });
        }
        
    }

    selectCustomer = (val) =>{
        if(val.label==="Nog te plannen"){
            this.setState({referCustomerFlag: false})
        }
        this.setState({val1: val.value});
        let tempArray = [];
        tempArray = this.props.customerData;
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

    getCustomerData = () => {
        let customerSelect = [];
        let customerData = this.props.customerData;
        if(this.props.salesOrder && customerData){
            customerData.map((customer, index)=>{
                if(customer.value===this.props.salesOrder.Customer){
                    customerSelect = { "label": customer.value, "value": customer.key }
                }
                return customerData;
            });
        }
        return customerSelect
    }

    getSupplierData = () => {
        let supplierSelect = [];
        let supplierData = this.state.supplier;
        if(this.props.salesOrder && supplierData){
            supplierData.map((supplier, index)=>{
                if(supplier.value===this.props.salesOrder.Supplier){
                    supplierSelect = { "label": supplier.value, "value": supplier.key }
                }
                return supplier;
            });
        }
        return supplierSelect
    }

    onChange = (e) => {
        let fileData = this.state.files;
        if(e.target.files[0]){
            e.target.files[0]['doctype'] = this.state.typeData[2].key;
            fileData.push(e.target.files[0]);
            this.setState({files: fileData, modalShow: true});
        }
    }

    handleDrop = (files, event) => {
        let fileData = this.state.files;
        for(var i=0; i<files.length; i++){
            files[i]['doctype']=this.state.typeData[2].key
            fileData.push(files[i]);
        }
        this.setState({files: fileData, modalShow: true});
    }

    openUploadFile = () =>{
        $('#inputFile').show();
        $('#inputFile').focus();
        $('#inputFile').click();
        $('#inputFile').hide();
    }

    fileUploadData = (orderid) => {
        this._isMounted = true;
        let fileArray = [];
        if(this.props.salesUploadFile){
            fileArray = this.props.salesUploadFile
        }
        let documentParam = [];
        let k = 1;
        let fileLength = fileArray.length;
        if(fileLength!==0){
            fileArray.map((file, index)=>{
                var formData = new FormData();
                formData.append('file', file);// file from input
                var headers = {
                    "headers": {
                        "Authorization": "bearer "+Auth.getUserToken(),
                    }
                }
                Axios.post(API.FileUpload, formData, headers)
                .then(result => {
                    documentParam = {
                        orderid: orderid,
                        fileid: result.data.Id,
                        typeid: file.doctype
                    }
                    Axios.post(API.PostOrderDocument, documentParam, headers)
                    .then(result=>{
                        if(this._isMounted){
                            this.setState({files: []})
                            this.props.salesFileBlank();
                            if(k===fileLength){
                                this.onHide();
                                if(!this.props.salesOrder){
                                    let salesOrderDetail = [];
                                    var header = SessionManager.shared().getAuthorizationHeader();
                                    Axios.get(API.GetSalesData, header)
                                    .then(result=>{
                                        if(result.data.Success){
                                            salesOrderDetail = result.data.Items.filter(item => item.id===Number(orderid));
                                            this.props.onloadSalesDetail(salesOrderDetail[0])
                                        }
                                    })
                                }else{
                                    this.props.getSalesOrderData();
                                }
                            }
                            k++;
                        }
                    })
                })
                return fileArray;
            });
        }else{
            this.onHide();
            if(!this.props.salesOrder){
                let salesOrderDetail = [];
                var header = SessionManager.shared().getAuthorizationHeader();
                Axios.get(API.GetSalesData, header)
                .then(result=>{
                    if(result.data.Success){
                        salesOrderDetail = result.data.Items.filter(item => item.id===Number(orderid));
                        this.props.onloadSalesDetail(salesOrderDetail[0])
                    }
                })
            }else{
                this.props.getSalesOrderData();
            }
        }
    }
    onHide = () => {
        this.props.salesFileBlank();
        this.setState({files: []})
        this.props.onHide();
    }

    changeSupplier = (value) => {
        this.setState({val2: value, arriFlag: true})
        this.state.supplier.map((supplier, index)=>{
            if(supplier.key===value){
                if(supplier.demurrage){
                    this.setState({arrivaleFlag: true});
                }else{
                    this.setState({arrivaleFlag: false});
                }
            }
            return supplier;
        });
    }

    onChangeDate = (date, e, mode) => {
        if(e.type==="click"){
            if(mode==="orderdate"){
                this.setState({orderdate:date, orderdateflag: true});
            }else{
                this.setState({arrivalDate: date, arrivalDateFlag: true})
            }
            
        }
    }

    handleEnterKeyPress = (e, mode) => {
        this.setState({flag: true});
        if(e.target.value.length===4){
            let today = new Date();
            let year = today.getFullYear();
            let date_day_month = e.target.value;
            let day = date_day_month.substring(0,2);
            let month = date_day_month.substring(2,4);
            let setDate = new Date(year + '-'+ month + '-' + day);
            if(mode==="orderdate"){
                this.setState({orderdate:setDate, orderdateflag: true});
            }else{
                this.setState({arrivalDate:setDate, arrivalDateFlag: true})
            }
        }
    }

    onHide = () => {
        this.props.onHide();
        Common.hideSlideForm();
    }

    downLoadFile = (fileId) => {
        window.open(API.GetDownloadFile+fileId);
    }

    render(){
        const { files, loadingFlag, referCustomerFlag } = this.state;
        let customer = [];
        let supplier = [];
        let rederijList = [];
        if(this.props.customerData){
            customer = this.props.customerData.map( s => ({value:s.key,label:s.value}));
        }
        if(this.state.supplier){
            supplier = this.state.supplier.map( s => ({value:s.key,label:s.value}));
        }
        if(this.state.rederijList){
            rederijList = this.state.rederijList.map( s => ({value:s.key,label:s.value}));
        }
        return (
            <div className = "slide-form__controls open" style={{height: "100%"}}>
                <div style={{marginBottom:30}}>
                    <i className="fas fa-times slide-close" style={{ fontSize: 20, cursor: 'pointer'}} onClick={()=>this.onHide()}></i>
                </div>
                <Form className="container" onSubmit = { this.handleSubmit }>
                    <Col className="title add-product">{trls('Add_Sales_Order')}</Col>
                    <Form.Group as={Row} controlId="formPlaintextSupplier">
                        <Col>
                            <Select
                                name="customer"
                                options={customer}
                                placeholder={trls('Customer')}
                                onChange={val => this.selectCustomer(val)}
                                defaultValue={this.getCustomerData()}
                            />
                            <label className="placeholder-label">{trls('Customer')}</label>
                            {!this.props.disabled && !this.props.salesOrder && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0, width: "100%" }}
                                    value={this.state.val1}
                                    required
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextSupplier">
                        <Col>
                            <Select
                                name="supplier"
                                options={supplier}
                                placeholder={trls('Supplier')}
                                onChange={val => this.changeSupplier(val.value)}
                                defaultValue={this.getSupplierData()}
                            />
                            <label className="placeholder-label">{trls('Supplier')}</label>
                            {!this.props.disabled && !this.props.salesOrder && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0, width: "100%" }}
                                    value={this.state.val2}
                                    required
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="product-text" controlId="formPlaintextPassword">
                        <Col>
                             {referCustomerFlag ? (
                                <Form.Control type="text" name="reference" required defaultValue = {this.props.salesOrder?this.props.salesOrder.referencecustomer:''} placeholder={trls('Reference')} />
                             ): 
                                <Form.Control type="text" name="reference" defaultValue = {this.props.salesOrder?this.props.salesOrder.referencecustomer:''} placeholder={trls('Reference')} />
                             }
                            
                            <label className="placeholder-label">{trls('Reference_customer')}</label>
                        </Col>
                    </Form.Group>
                    {this.state.arrivaleFlag && this.state.arriFlag && (
                        <Form.Group as={Row} className="product-text" controlId="formPlaintextPassword">
                            <Col>
                            <Select
                                name="rederij"
                                options={rederijList}
                                placeholder={trls('Shipping_company')}
                                onChange={val => this.setState({val3: val.value})}
                            />
                            <label className="placeholder-label">{trls('Shipping_company')}</label>
                            {!this.props.disabled && !this.props.salesOrder && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0, width: "100%" }}
                                    value={this.state.val3}
                                    required
                                />
                            )}
                            </Col>
                        </Form.Group>
                    )}
                    {this.state.arrivaleFlag && this.state.arriFlag && (
                        <Form.Group as={Row} className="product-text" controlId="formPlaintextPassword">
                            <Col>
                                <Form.Control type="text" name="uithaalreferentie" required placeholder={trls('Reference')} />
                                <label className="placeholder-label">{trls('Picking_reference')}</label>
                            </Col>
                        </Form.Group>
                    )}
                    <Form.Group as={Row} className="product-text" controlId="formPlaintextPassword">
                        <Col>
                            { this.state.orderdateflag || !this.props.salesOrder ? (
                                <DatePicker name="orderdate" className="myDatePicker" isClearable={true} dateFormat="dd-MM-yyyy" selected={this.state.orderdate} onChange = {(value, e)=>this.onChangeDate(value, e, 'orderdate')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'orderdate')}/>}/>
                            ) : <DatePicker name="orderdate" className="myDatePicker" isClearable={true} dateFormat="dd-MM-yyyy" selected={new Date(this.props.salesOrder.loadingdate)} onChange = {(value, e)=>this.onChangeDate(value, e, 'orderdate')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'orderdate')}/>}/>
                            } 
                            <label className="placeholder-label">{trls('Loading_date')}</label>
                        </Col>
                    </Form.Group>
                    {!this.state.arriFlag && this.props.arrivaldate && this.props.salesOrder?(
                        <Form.Group as={Row} className="product-text" controlId="formPlaintextPassword">
                            <Col>
                                { this.state.arrivalDateFlag || !this.props.arrivaldate ? (
                                    <DatePicker name="arrivaldate" className="myDatePicker" isClearable={true} dateFormat="dd-MM-yyyy" selected={this.state.arrivalDate} onChange = {(value, e)=>this.onChangeDate(value, e, 'arrivaldate')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'arrivaldate')}/>}/>
                                ) : <DatePicker name="arrivaldate" className="myDatePicker" isClearable={true} dateFormat="dd-MM-yyyy" selected={new Date(this.props.salesOrder.arrivaldate)} onChange = {(value, e)=>this.onChangeDate(value, e, 'arrivaldate')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'arrivaldate')}/>}/>
                                } 
                                <label className="placeholder-label">{trls('Arrival_date')}</label>
                            </Col>
                        </Form.Group>
                    ):<div></div>}
                    {this.state.arrivaleFlag && this.state.arriFlag?(
                        <Form.Group as={Row} className="product-text" controlId="formPlaintextPassword">
                            <Col>
                                { this.state.arrivalDateFlag || !this.props.arrivaldate ? (
                                    <DatePicker name="arrivaldate" className="myDatePicker" isClearable={true} dateFormat="dd-MM-yyyy" selected={this.state.arrivalDate} onChange = {(value, e)=>this.onChangeDate(value, e, 'arrivaldate')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'arrivaldate')}/>}/>
                                ) : <DatePicker name="arrivaldate" className="myDatePicker" isClearable={true} dateFormat="dd-MM-yyyy" selected={new Date(this.props.salesOrder.arrivaldate)} onChange = {(value, e)=>this.onChangeDate(value, e, 'arrivaldate')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'arrivaldate')}/>}/>
                                } 
                                <label className="placeholder-label">{trls('Arrival_date')}</label>
                            </Col>
                        </Form.Group>
                    ):null}
                    <Form.Group as={Row} controlId="formPlaintextSupplier">
                        <Col className="product-text input-div" style={{height: "auto"}}>
                            <div id="react-file-drop-demo" style={{border: '1px solid #ced4da', color: 'black', padding: 7, borderRadius: 3, minHeight: 40}}>
                                <FileDrop onDrop={this.handleDrop}>
                                    {files.length>0?(
                                        files.map((data,i) =>(
                                            <div id={i} key={i} style={{cursor: "pointer"}} onClick={()=>this.openUploadFile()}>
                                                {data.name}
                                            </div>
                                        ))
                                    ):
                                        <div style={{cursor: "pointer"}} onClick={()=>this.openUploadFile()}>{trls("Click_or_Drop")}</div> 
                                    }
                                     <input id="inputFile" name="file" type="file" accept="*.*"  onChange={this.onChange} style={{display: "none"}} />   
                                </FileDrop>
                                <label className="placeholder-label">{trls('Attachments')}</label>
                            </div>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control as="textarea" rows="3" name="comments" placeholder={trls("Comments")} />
                            <label className="placeholder-label">{trls('Comments')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group style={{textAlign:"center"}}>
                        <Button type="submit" style={{width:"100px"}}>{trls('Save')}</Button>
                    </Form.Group>
                    <Customernote
                        show={this.state.noteModalShow}
                        onHide={() => this.setState({noteModalShow: false})}
                        customerNote={this.state.customerNote}
                    />
                </Form>
                <Typeform
                    show={this.state.modalShow}
                    onHide={() => this.setState({modalShow: false})}
                    files={this.state.files}
                    orderid={this.state.orderid}
                    typedata={this.state.typeData}
                />
                <Pageloadspiiner loading = {loadingFlag}/>     
            </div>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Salesform);