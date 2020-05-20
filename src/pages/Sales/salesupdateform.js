import React, {Component} from 'react'
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { connect } from 'react-redux';
import * as salesAction  from '../../actions/salesAction';
import DatePicker from "react-datepicker";
import SessionManager from '../../components/session_manage';
import Customernote from '../../components/customer_note';
import API from '../../components/api'
import Axios from 'axios';
import history from '../../history';
import { trls } from '../../components/translate';
import * as Common from '../../components/common';
import FileDrop from 'react-file-drop';
import $ from 'jquery';
import * as Auth   from '../../components/auth';
import Typeform from './documenttype_form';
import DraggableModalDialog from '../../components/draggablemodal';
import Pageloadspiiner from '../../components/page_load_spinner';

const mapStateToProps = state => ({ 
    ...state,
    customerData: state.common.customerData,
    salesUploadFile: state.common.salesFile

});

const mapDispatchToProps = (dispatch) => ({
    getCustomer: () =>
        dispatch(salesAction.getCustomerData()),
    salesFileBlank: () =>
        dispatch(salesAction.salesFileBlank()),
});

class Salesupdateform extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            orderdate: new Date(), 
            arrivalDate: new Date(),
            arrivalDateFlag: false,
            val1: '',
            val2: '',
            customerNote: '',
            purchaseData: [],
            files: [],
            supplier: [],
            orderid: '',
            arrivaleFlag: false,
            arriFlag: false,
            loading: false,
            pageLodingFlag: false,
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
        this.setState({pageLodingFlag: true});
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
                comments: data.comments
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
                comments: data.comments,
                rederij: data.rederij ? data.rederij : '',
                uithaalreferentie: data.uithaalreferentie ? data.uithaalreferentie : ''
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
                            if(fileLength === k){
                                this.onHide();
                                if(!this.props.salesOrder){
                                    history.push('/sales-order-detail',{ newId: orderid, customercode:this.state.val1, suppliercode: this.state.val2, newSubmit:false, quality: false});
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
            if(!this.props.salesOrder){
                history.push('/sales-order-detail',{ newId: orderid, customercode:this.state.val1, suppliercode: this.state.val2, newSubmit:false, quality: false});
                this.onHide();
            }else{
                this.props.getSalesOrderData();
                this.onHide();
            }
        }
    }
    onHide = () => {
        this.props.onHide();
        this.props.salesFileBlank();
        this.setState({files: []})
        this.setState({pageLodingFlag: false});
    }

    changeSupplier = (value) => {
        this.setState({val2: value, arriFlag: true})
        this.state.supplier.map((supplier, index)=>{
            if(supplier.key===value){
                if(supplier.demurrage){
                    this.setState({arrivaleFlag: true})
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

    render(){
        let fileData = this.state.files;
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
        const { salesOrder } = this.props;
        const { val1, pageLodingFlag } = this.state;
        let referenceCustomerFlag = true;
        if(!val1){
            if(!salesOrder.CustomerCode ){
                referenceCustomerFlag = false;
            }else{
                referenceCustomerFlag = true;
            }
        }else{
            if(val1.value==='99999998'){
                referenceCustomerFlag = false
            }else{
                referenceCustomerFlag = true
            }
        }
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
                    {!this.props.salesOrder?trls('Sales_Order'):trls('Sales_Order_Edit')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="container product-form" onSubmit = { this.handleSubmit }>
                    <Form.Group as={Row} controlId="formPlaintextSupplier">
                        <Col className="product-text">
                            <Select
                                name="customer"
                                options={customer}
                                placeholder={trls('Customer')}
                                onChange={val => this.selectCustomer(val)}
                                defaultValue={{"value": salesOrder.CustomerCode ? salesOrder.CustomerCode : '99999998', "label": salesOrder.Customer ? salesOrder.Customer : "Nog te plannen"}}
                            />
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
                            <label className="placeholder-label">{trls('Customer')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextSupplier">
                        <Col className="product-text">
                            <Select
                                name="supplier"
                                options={supplier}
                                placeholder={trls('Supplier')}
                                onChange={val => this.changeSupplier(val.value)}
                                defaultValue={{"value": salesOrder.SupplierCode ? salesOrder.SupplierCode.replace(/ /g, "") : '', "label": salesOrder.Supplier ? salesOrder.Supplier : ''}}
                            />
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
                            <label className="placeholder-label">{trls('Supplier')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            {referenceCustomerFlag ? (
                                <Form.Control type="text" name="reference" required defaultValue = {this.props.salesOrder?this.props.salesOrder.referencecustomer:''} placeholder={trls('Reference')} />
                            ): 
                                <Form.Control type="text" name="reference" defaultValue = {this.props.salesOrder?this.props.salesOrder.referencecustomer:''} placeholder={trls('Reference')} />
                            }
                            <label className="placeholder-label">{trls('Reference_customer')}</label>
                        </Col>
                    </Form.Group>
                    {!this.state.arriFlag && this.props.arrivaldate && this.props.salesOrder && (
                        <Form.Group as={Row} className="product-text" controlId="formPlaintextPassword">
                            <Col>
                                <Select
                                    name="rederij"
                                    options={rederijList}
                                    placeholder={trls('Shipping_company')}
                                    onChange={val => this.setState({val3: val.value})}
                                    defaultValue={{value: salesOrder.RederijCode ? salesOrder.RederijCode : '', label: salesOrder.Rederij}}
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
                                <Select
                                    name="rederij"
                                    options={rederijList}
                                    placeholder={trls('Shipping_company')}
                                    onChange={val => this.setState({val3: val.value})}
                                    defaultValue={{value: salesOrder.RederijCode ? salesOrder.RederijCode : '', label: salesOrder.Rederij}}
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
                                <Form.Control type="text" name="uithaalreferentie" required defaultValue={salesOrder.Uithaalreferentie ? salesOrder.Uithaalreferentie : ''} placeholder={trls('Reference')} />
                                <label className="placeholder-label">{trls('Picking_reference')}</label>
                            </Col>
                        </Form.Group>
                    )}
                    {!this.state.arriFlag && this.props.arrivaldate && this.props.salesOrder && (
                        <Form.Group as={Row} className="product-text" controlId="formPlaintextPassword">
                            <Col>
                                <Form.Control type="text" name="uithaalreferentie" required defaultValue={salesOrder.Uithaalreferentie ? salesOrder.Uithaalreferentie : ''} placeholder={trls('Reference')} />
                                <label className="placeholder-label">{trls('Picking_reference')}</label>
                            </Col>
                        </Form.Group>
                    )}
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            { this.state.orderdateflag || !this.props.salesOrder ? (
                                <DatePicker name="orderdate" className="myDatePicker" isClearable={true} dateFormat="dd-MM-yyyy" selected={this.state.orderdate ? this.state.orderdate : new Date()} onChange = {(value, e)=>this.onChangeDate(value, e, 'orderdate')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'orderdate')}/>}/>
                            ) : <DatePicker name="orderdate" className="myDatePicker" isClearable={true} dateFormat="dd-MM-yyyy" selected={salesOrder.loadingdate!=="1900-01-01T00:00:00" ? new Date(salesOrder.loadingdate) : ''} onChange = {(value, e)=>this.onChangeDate(value, e, 'orderdate')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'orderdate')}/>}/>
                            } 
                            <label className="placeholder-label">{trls('Loading_date')}</label>
                        </Col>
                    </Form.Group>
                    {!this.state.arriFlag && this.props.arrivaldate && this.props.salesOrder?(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Col className="product-text">
                                { this.state.arrivalDateFlag || !this.props.arrivaldate ? (
                                    <DatePicker name="arrivaldate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.state.arrivalDate ? this.state.arrivalDate : new Date()} onChange = {(value, e)=>this.onChangeDate(value, e, 'arrivaldate')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'arrivaldate')}/>}/>
                                ) : <DatePicker name="arrivaldate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.props.salesOrder.arrivaldate ? new Date(this.props.salesOrder.arrivaldate) : ''} onChange = {(value, e)=>this.onChangeDate(value, e, 'arrivaldate')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'arrivaldate')}/>}/>
                                } 
                                <label className="placeholder-label">{trls('Arrival_date')}</label>
                            </Col>
                        </Form.Group>
                    ):<div></div>}
                    {this.state.arrivaleFlag && this.state.arriFlag?(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Col className="product-text">
                                { this.state.arrivalDateFlag || !this.props.arrivaldate ? (
                                    <DatePicker name="arrivaldate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.state.arrivalDate ? this.state.arrivalDate : new Date()} onChange = {(value, e)=>this.onChangeDate(value, e, 'arrivaldate')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'arrivaldate')}/>}/>
                                ) : <DatePicker name="arrivaldate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.props.salesOrder.arrivaldate ? new Date(this.props.salesOrder.arrivaldate) : ''} onChange = {(value, e)=>this.onChangeDate(value, e, 'arrivaldate')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'arrivaldate')}/>}/>
                                } 
                                <label className="placeholder-label">{trls('Arrival_date')}</label>
                            </Col>
                        </Form.Group>
                    ):<div></div>}
                    <Form.Group as={Row} controlId="formPlaintextSupplier">
                        <Col className="product-text input-div" style={{height: "auto"}}>
                            <div id="react-file-drop-demo" style={{border: '1px solid #ced4da', color: 'black', padding: 7, borderRadius: 3 }}>
                                <FileDrop onDrop={this.handleDrop}>
                                    {fileData.length>0?(
                                        fileData.map((data,i) =>(
                                            <div id={i} key={i} style={{cursor: "pointer"}} onClick={()=>this.openUploadFile()}>
                                                {data.name}
                                            </div>
                                        ))
                                    ):
                                        <div style={{cursor: "pointer"}} onClick={()=>this.openUploadFile()}>{trls("Click_or_Drop")}</div> 
                                    }
                                     <input id="inputFile" name="file" type="file" accept="*.*"  onChange={this.onChange} style={{display: "none"}} />   
                                </FileDrop>
                            </div>
                            <label className="placeholder-label">{trls('Attachments')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control as="textarea" rows="3" name="comments" defaultValue = {this.props.salesOrder?this.props.salesOrder.Comments:''}  placeholder={trls("Comments")} />
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
            </Modal.Body>
            <Typeform
                show={this.state.modalShow}
                onHide={() => this.setState({modalShow: false})}
                files={this.state.files}
                orderid={this.state.orderid}
                typedata={this.state.typeData}
            />
            <Pageloadspiiner loading = {pageLodingFlag}/>
        </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Salesupdateform);