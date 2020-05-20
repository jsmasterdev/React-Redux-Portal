import React, {Component} from 'react'
import $ from 'jquery';
import { getUserToken } from '../../components/auth';
import { trls } from '../../components/translate';
import { Button } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import { Form, Row, Col} from 'react-bootstrap';
import DatePicker from "react-datepicker";
import { connect } from 'react-redux';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import * as authAction  from '../../actions/authAction';
import ListErrors from '../../components/listerrors';
import * as Common from '../../components/common'
import DraggableModalDialog from '../../components/draggablemodal';

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
    postPriceError: (params) =>
        dispatch(authAction.dataServerFail(params)),
    removeState: () =>
        dispatch(authAction.blankdispatch()),
});

class Productpriceform extends Component {
      constructor(props) {
        super(props);
        let today = new Date();
        let year = today.getFullYear();
        this.state = {  
            token: window.localStorage.getItem('token'),
            transportlist:[],
            modalShow: false,
            redirect: false,
            startdate: '',
            enddate: '',
            product_id: "",
            transprot_key: "",
            pricetype: "",
            title: "",
            currentYear: year,
            startSelectDate: new Date(year+'-01-01'),
            endSelectDate: new Date(year+'-12-31'),
            flag: false
            
        };
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleSubmit = (event) => {
        let url=""
        event.preventDefault();
        const clientFormData = new FormData(event.target);
        const data = {};
        for (let key of clientFormData.keys()) {
        data[key] = clientFormData.get(key);
        }
        this.setState({token:data.token});
        let productId ={
        productid: this.props.productid
        }
        let priceParams = {}
        var headers = SessionManager.shared().getAuthorizationHeader();
        if(this.props.price_flag!==3){
            if(this.props.price_flag===1){
                if(!this.props.editpriceflag){
                    url=API.PostPurchasePrice;
                }else{
                    url=API.PutPurchasePrice;
                }
                if(!this.props.editpriceflag){
                    priceParams = {
                        productid: this.props.productid,
                        startdate: Common.formatDateSecond(data.startdate),
                        enddate: Common.formatDateSecond(data.enddate),
                        price: Common.formatDecimal(data.price)
                    }
                }else{
                    priceParams = {
                        id: this.props.editpricedata.Id,
                        startdate: Common.formatDateSecond(data.startdate),
                        enddate: Common.formatDateSecond(data.enddate),
                        price: Common.formatDecimal(data.price)
                    }
                }
            }else if(this.props.price_flag===2){
                if(!this.props.editpriceflag){
                    url=API.PostSalesPrice;
                }else{
                    url=API.PutSalesPrice;
                }
                if(!this.props.editpriceflag){
                    priceParams = {
                        productid: this.props.productid,
                        startdate: Common.formatDateSecond(data.startdate),
                        enddate: Common.formatDateSecond(data.enddate),
                        price: Common.formatDecimal(data.price)
                    }
                }else{
                    priceParams = {
                        id: this.props.editpricedata.Id,
                        startdate: Common.formatDateSecond(data.startdate),
                        enddate: Common.formatDateSecond(data.enddate),
                        price: Common.formatDecimal(data.price)
                    }
                }
            }
            Axios.post(url, priceParams, headers)
            .then(response => {
                if(response.data.Success===true){
                    this.setState({ 
                        startdate:'',
                        enddate:''
                    })
                    Axios.post(API.PostPricechangeTask, productId, headers)
                    .then(result => {
                        console.log("OK");
                    });
                    if(this.props.editpriceflag){
                        this.props.viewPurchaseLine(data.startdate, data.enddate, data.price, this.props.price_flag, null);
                    }
                    this.props.onHide();
                    if(this.props.price_flag===1){
                        this.props.onGetPurchasePrice();
                    }else if(this.props.price_flag===2){
                        this.props.onGetSalesPrice();
                    }
                }
            })
        }else{
            let transportParams = {};
            if(!this.props.editpriceflag){
                url = API.PostTransportPrice;
                transportParams = {
                    productid: this.props.productid,
                    startdate: Common.formatDateSecond(data.startdate),
                    enddate: Common.formatDateSecond(data.enddate),
                    pricingType: data.pricingtype,
                    transporter: data.transport,
                    price: Common.formatDecimal(data.price)
                }
            }else{
                url = API.PutTransportPrice;
                transportParams = {
                    id: this.props.editpricedata.Id,
                    startdate: Common.formatDateSecond(data.startdate),
                    enddate: Common.formatDateSecond(data.enddate),
                    price: Common.formatDecimal(data.price)
                }
            }
            Axios.post(url, transportParams, headers)
            .then(result => {
                if(result.data.Success){
                    this.setState({
                        startdate:'',
                        enddate:''
                    })
                    var headers = SessionManager.shared().getAuthorizationHeader();
                    Axios.post(API.PostPricechangeTask, productId, headers)
                    .then(result => {
                        console.log("OK");
                    });
                    if(this.props.editpriceflag){
                        this.props.viewPurchaseLine(data.startdate, data.enddate, data.price, this.props.price_flag, this.props.editpricedata.TransporterCode);
                    }
                    this.props.onHide();
                    this.props.onGetTransportPrice()
                }else{
                    this.props.postPriceError(trls("Please_set_pricetype"))
                }
                
            });
        }
    }

    componentDidMount() {
        const data = {
            "url": API.GetTransportersDropdown,
            "method": "GET",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization":"Bearer "+getUserToken()
            }
          }
        $.ajax(data).done(function (response) {
        })
        .then(response => {
              this.setState({transportlist: response.Items})
        })
    }
    
    onHide = () => {
        this.props.onHide();
        this.props.onRemoveState();
    }

    onChangeDate = (date, e, mode) => {
        if(e.type==="click"){
            if(mode==="start"){
                this.setState({startdate: date})
            }else{
                this.setState({enddate: date})
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
            let setDate = new Date(year + '-'+ month + '-' + day)
            if(mode==="start"){
                this.setState({startdate: setDate})
            }else{
                this.setState({enddate: setDate})
            }
        }
    }

    render(){
        if(this.props.price_flag===1){
            return (
                <Modal
                    show={this.props.show}
                    dialogAs={DraggableModalDialog}
                    onHide={this.onHide}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    backdrop= "static"
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {trls("Purchase_Price")}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                            <Form className="container product-form" onSubmit = { this.handleSubmit }>
                                
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Form.Label column sm="3">
                                        {trls("Price")}  
                                    </Form.Label>
                                    <Col sm="9" className="product-text">
                                        <Form.Control type="text" name="price" defaultValue={this.props.editpriceflag ? this.props.editpricedata.Price : ''} required placeholder="Price" />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Form.Label column sm="3">
                                        {trls("Start_date")} 
                                    </Form.Label>
                                    <Col sm="9" className="product-text">
                                        {!this.state.startdate ? (
                                            <DatePicker name="startdate" id="startdatetest" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.props.editpriceflag ? new Date(this.props.editpricedata.StartDate) : this.state.startSelectDate} onChange = {(value, e)=>this.onChangeDate(value, e, 'start')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'start')}/>}/>
                                        ) : <DatePicker name="startdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date(this.state.startdate)} onChange = {(value, e)=>this.onChangeDate(value, e, 'start')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'start')}/>} />
                                        } 
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Form.Label column sm="3">
                                        {trls("End_date")} 
                                    </Form.Label>
                                    <Col sm="9" className="product-text">
                                        {!this.state.enddate ? (
                                            <DatePicker name="enddate"  className="myDatePicker" dateFormat="dd-MM-yyyy" selected={ this.props.editpriceflag ? new Date(this.props.editpricedata.EndDate) : this.state.endSelectDate} onChange = {(value, e)=>this.onChangeDate(value, e, 'end')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'end')}/>} />
                                        ) : <DatePicker name="enddate"  className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date(this.state.enddate)} onChange = {(value, e)=>this.onChangeDate(value, e, 'end')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'end')}/>} />
                                        }
                                    </Col>
                                </Form.Group>
                                <Form.Group style={{textAlign:"center"}}>
                                    <Button type="submit" style={{width:"100px"}}>{trls('Save')}</Button>
                                </Form.Group>
                            </Form>
                    </Modal.Body>
                </Modal>
              );
          }else if(this.props.price_flag===2){
            return (
                <Modal
                    dialogAs={DraggableModalDialog}
                    show={this.props.show}
                    onHide={this.onHide}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                  <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {trls("Sales_Price")}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                      <Form className="container product-form" onSubmit = { this.handleSubmit }>
                          <Form.Group as={Row} controlId="formPlaintextPassword">
                              <Form.Label column sm="3">
                                  {trls("Price")}  
                              </Form.Label>
                              <Col sm="9" className="product-text">
                                  <Form.Control type="text" name="price" defaultValue={this.props.editpriceflag ? this.props.editpricedata.Price : ''} required placeholder="Price" />
                              </Col>
                          </Form.Group>
                          <Form.Group as={Row} controlId="formPlaintextPassword">
                              <Form.Label column sm="3">
                                  {trls("Start_date")}  
                              </Form.Label>
                              <Col sm="9" className="product-text">
                                  {!this.state.startdate ? (
                                     <DatePicker name="startdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.props.editpriceflag ? new Date(this.props.editpricedata.StartDate) : this.state.startSelectDate}  onChange = {(value, e)=>this.onChangeDate(value, e, 'start')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'start')}/>} />
                                  ) : <DatePicker name="startdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.state.startdate} onChange = {(value, e)=>this.onChangeDate(value, e, 'start')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'start')}/>} />
                                  } 
                                  
                              </Col>
                          </Form.Group>
                          <Form.Group as={Row} controlId="formPlaintextPassword">
                              <Form.Label column sm="3">
                                  {trls("End_date")}  
                              </Form.Label>
                              <Col sm="9" className="product-text">
                                  {!this.state.enddate ? (
                                     <DatePicker name="enddate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={ this.props.editpriceflag ? new Date(this.props.editpricedata.EndDate) : this.state.endSelectDate} onChange = {(value, e)=>this.onChangeDate(value, e, 'end')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'end')}/>} />
                                  ) : <DatePicker name="enddate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.state.enddate} onChange = {(value, e)=>this.onChangeDate(value, e, 'end')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'end')}/>}/>
                                  }
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
          else{
            let defaultransport = [];
            let defaultpricetype = [];
            const transportlist = this.state.transportlist.map( s => ({value:s.Key,label:s.Value}));
            const pricingtypelist = [
                { value: '1', label: 'Blokvracht' },
                { value: '2', label: 'Eenheidsprijs' },
              ];
            if(this.props.editpriceflag){
                defaultransport  = transportlist.filter(item => item.label === this.props.editpricedata.Transporter);
                defaultpricetype = pricingtypelist.filter(item => item.value === this.props.editpricedata.pricingtype);
            }
            return (
                <Modal
                    dialogAs={DraggableModalDialog}
                    show={this.props.show}
                    onHide={this.onHide}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {trls('Transport_Price')}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className="container product-form" onSubmit = { this.handleSubmit }>
                                <ListErrors errors={this.props.error} />
                            <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Form.Label column sm="3">
                                        {trls('Transporter')}  
                                    </Form.Label>
                                    <Col sm="9" className="product-text">
                                        <Select
                                            name="transport"
                                            options={transportlist}
                                            onChange={val => this.setState({transprot_key:val})}
                                            defaultValue={defaultransport}
                                            isDisabled = {this.props.editpriceflag ? true : false}
                                        />
                                        {!this.props.disabled && !this.props.editpriceflag && (
                                            <input
                                                onChange={val=>console.log()}
                                                tabIndex={-1}
                                                autoComplete="off"
                                                style={{ opacity: 0, height: 0 }}
                                                value={this.state.transprot_key}
                                                required
                                                />
                                        )}
                                    </Col>
                            </Form.Group>
                            {this.state.transprot_key.value!=="99999999" ? (
                                    <Form.Group as={Row} controlId="formPlaintextPassword">
                                            <Form.Label column sm="3">
                                                {trls('Pricingtype')}  
                                            </Form.Label>
                                            <Col sm="9" className="product-text">
                                                <Select
                                                    name="pricingtype"
                                                    options={pricingtypelist}
                                                    onChange={val => this.setState({pricetype:val})}
                                                    defaultValue={defaultpricetype}
                                                    isDisabled = {this.props.editpriceflag ? true : false}
                                                />
                                                {!this.props.disabled && !this.props.editpriceflag && (
                                                    <input
                                                        onChange={val=>console.log()}
                                                        tabIndex={-1}
                                                        autoComplete="off"
                                                        style={{ opacity: 0, height: 0 }}
                                                        value={this.state.pricetype}
                                                        required
                                                        />
                                                )}
                                            </Col>
                                    </Form.Group>
                                ) : null
                                }
                            <Form.Group as={Row} controlId="formPlaintextPassword">
                                <Form.Label column sm="3">
                                    {trls('Price')}  
                                </Form.Label>
                                <Col sm="9" className="product-text">
                                    <Form.Control type="text" name="price" defaultValue={this.props.editpriceflag ? this.props.editpricedata.price : ''} required placeholder="Price" />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formPlaintextPassword">
                                <Form.Label column sm="3">
                                    {trls('Start_date')}  
                                </Form.Label>
                                <Col sm="9" className="product-text">
                                    {!this.state.startdate ? (
                                        <DatePicker name="startdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.props.editpriceflag ? new Date(this.props.editpricedata.startdate) : this.state.startSelectDate} onChange = {(value, e)=>this.onChangeDate(value, e, 'start')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'start')}/>} />
                                    ) : <DatePicker name="startdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.state.startdate} onChange = {(value, e)=>this.onChangeDate(value, e, 'start')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'start')}/>} />
                                    } 
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formPlaintextPassword">
                                <Form.Label column sm="3">
                                    {trls('End_date')}  
                                </Form.Label>
                                <Col sm="9" className="product-text">
                                    {!this.state.enddate ? (
                                        <DatePicker name="enddate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={ this.props.editpriceflag ? new Date(this.props.editpricedata.enddate) : this.state.endSelectDate} onChange = {(value, e)=>this.onChangeDate(value, e, 'end')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'end')}/>}/>
                                    ) : <DatePicker name="enddate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.state.enddate} onChange = {(value, e)=>this.onChangeDate(value, e, 'end')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, 'end')}/>}/>
                                    }
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
    }
    export default connect(mapStateToProps, mapDispatchToProps)(Productpriceform);