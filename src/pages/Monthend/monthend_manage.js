import React, {Component} from 'react'
import { Form, Row, Button, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import $ from 'jquery';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import { BallBeat } from 'react-pure-loaders';
import { trls } from '../../components/translate';
import 'datatables.net';
import Filtercomponent from '../../components/filtercomponent';
import Contextmenu from '../../components/contextmenu';
import * as Common  from '../../components/common';
import Salesorderdetail from '../Sales/selesorder_detail';
import Purchaseorderdetail from '../Purchase/purchaseorder_detail';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
    
});
class Monthendmanage extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {  
            monthEndData: [],
            filterColunm: [
                {"label": 'ItemCode', "value": "ProductCode", "type": 'text', "show": true},
                {"label": 'Loading_Date', "value": "Loadingdate", "type": 'date', "show": true},
                {"label": 'Sales ID', "value": "salesid", "type": 'text', "show": true},
                {"label": 'SalesExactBooking', "value": "SalesExactBooking", "type": 'text', "show": true},
                {"label": 'Sales number', "value": "SalesQuantity", "type": 'text', "show": true},
                {"label": 'Sales Amount', "value": "SalesAmount", "type": 'text', "show": true},
                {"label": 'Purchase ID', "value": "purchaseid", "type": 'text', "show": true},
                {"label": 'PurchseExactBooking', "value": "PurchseExactBooking", "type": 'text', "show": true},
                {"label": 'Purchase number', "value": "PurchaseQuantity", "type": 'text', "show": true},
                {"label": 'Purchase Amount', "value": "PurchaseAmount", "text": 'text', "show": true},
                {"label": 'Transport ID', "value": "transportid", "type": 'text', "show": true},
                {"label": 'TransportExactBooking', "value": "TransportExactBooking", "type": 'text', "show": true},
                {"label": 'Transport number', "value": "TransportQuantity", "type": 'text', "show": true},
                {"label": 'Transport Amount', "value": "TransportAmount", "type": 'text', "show": true},
            ],
            filterData: [],
            originFilterData: [],
            slideDetailFlag: false,
            salesNewId: '',
            purchaseNewId: ''
        };
    }

    componentDidMount() {
        this._isMounted=true
        this.getMonthEndData();
        this.setFilterData();
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    getMonthEndData (data) {
        this._isMounted = true;
        this.setState({loading:true})
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetMonthEnd, headers)
        .then(result => {
            if(this._isMounted){
                if(!data){
                    let itemData = result.data.Items;
                    itemData.sort(function(a, b){return new Date(b.Loadingdate) - new Date(a.Loadingdate)});
                    this.setState({monthEndData: itemData, originFilterData: result.data.Items});
                }else{
                    let itemData = data;
                    itemData.sort(function(a, b){return new Date(b.Loadingdate) - new Date(a.Loadingdate)});
                    this.setState({monthEndData: data});
                }
                this.setState({loading:false})
                $('.fitler').on( 'keyup', function () {
                    table.search( this.value ).draw();
                } );
                $('#monthend-table').dataTable().fnDestroy();
                var table = $('#monthend-table').DataTable(
                    {
                        "language": { 
                            "lengthMenu": trls("Show")+" _MENU_ "+trls("Entries"),
                            "zeroRecords": "Nothing found - sorry",
                            "info": trls("Show_page")+" _PAGE_ of _PAGES_",
                            "infoEmpty": "No records available",
                            "infoFiltered": "(filtered from _MAX_ total records)",
                            "search": trls('Search'),
                            "paginate": {
                                "previous": trls('Previous'),
                                "next": trls('Next')
                        }
                      },
                        "dom": 't<"bottom-datatable" lip>',
                        // "order": [[ 8 ,'dsc']]
                        "ordering": false
                    }
                  );
            }
        });
    }

    // filter module
    setFilterData = () => {
        let filterData = [
            {"label": trls('ItemCode'), "value": "ProductCode", "type": 'text'},
            {"label": trls('Loading_Date'), "value": "Loadingdate", "type": 'date'},
            {"label": trls('SalesExactBooking'), "value": "SalesExactBooking", "type": 'num_opinion', "show": true},
            {"label": trls('PurchseExactBooking'), "value": "PurchseExactBooking", "type": 'num_opinion', "show": true},
            {"label": trls('TransportExactBooking'), "value": "TransportExactBooking", "type": 'num_opinion', "show": true}
        ]
        this.setState({filterData: filterData});
    }

    filterOptionData = (filterOption) =>{
        let dataA = []
        dataA = Common.filterData(filterOption, this.state.originFilterData);
        if(!filterOption.length){
            dataA=null;
        }
        $('#monthend-table').dataTable().fnDestroy();
        this.getMonthEndData(dataA);
    }

    changeFilter = () => {
        if(this.state.filterFlag){
            this.setState({filterFlag: false})
        }else{
            this.setState({filterFlag: true})
        }
    }
    // filter module
    loadSalesDetail = (data)=>{
        // Common.showSlideForm();
        this.setState({newId: data.id, slideDetailFlag: true})
    }

    addSales = () => {
        this.setState({copyProduct: '', copyFlag: 1, slideFormFlag: true});
        Common.showSlideForm();
    }

    removeColumn = (value) => {
        let filterColunm = this.state.filterColunm;
        filterColunm = filterColunm.filter(function(item, key) {
        if(trls(item.label)===value){
            item.show = false;
        }
        return item;
        })
        this.setState({filterColunm: filterColunm})
    }

    showColumn = (value) => {
        let filterColum = this.state.filterColunm;
        filterColum = filterColum.filter((item, key)=>item.label===value);
        return filterColum[0].show;
    }

    addFilterColumn = (value) => {
        // let filterColum = this.state.filterColunm;
        // let filterData = this.state.filterData;
        // let filterItem = [];
        // filterColum = filterColum.filter(function(item, key) {
        //   return item.label === value
        // })
        // filterItem = filterData.filter((item, key)=>item.label===value);
        // if(!filterItem[0]){
        //   filterData.push(filterColum[0]);
        // }
        // this.setState({filterData: filterData})
    }

    loadSalesDetail = (salesId)=>{
        this.setState({salesNewId: salesId, slideDetailFlag: true});
    }

    loadPurchaseDetail = (purchaseId) => {
        this.setState({purchaseNewId: purchaseId, slideDetailFlag: true});
    }

    render () {
        const {filterColunm, monthEndData} = this.state;
        console.log("monthendData",monthEndData);
        return (
            <div className="order_div">
                <div className="content__header content__header--with-line">
                    <div id="google_translate_element"></div>
                    <h2 className="title">{trls("Month End")}</h2>
                </div>
                <div className="orders">
                    <Row>
                        <Col sm={6}>
                            <ReactHTMLTableToExcel
                                id="test-table-xls-button"
                                className="btn btn-primary"
                                table="monthend-table-xl"
                                filename="tablexls"
                                sheet="tablexls"
                                buttonText={trls("Excel export")}/>
                        </Col>
                        <Col sm={6} className="has-search">
                            <div style={{display: 'flex', float: 'right'}}>
                                <Button variant="light" onClick={()=>this.changeFilter()}><i className="fas fa-filter add-icon"></i>{trls('Filter')}</Button>   
                                <div style={{marginLeft: 20}}>
                                    <span className="fa fa-search form-control-feedback"></span>
                                    <Form.Control className="form-control fitler" type="text" name="number"placeholder={trls("Quick_search")}/>
                                </div>
                            </div>
                        </Col>
                        {this.state.filterData.length>0&&(
                            <Filtercomponent
                                onHide={()=>this.setState({filterFlag: false})}
                                filterData={this.state.filterData}
                                onFilterData={(filterOption)=>this.filterOptionData(filterOption)}
                                showFlag={this.state.filterFlag}
                            />
                        )}
                    </Row>
                    <div className="table-responsive">
                        <table id="monthend-table" className="place-and-orders__table table" width="100%">
                            <thead>
                            <tr>
                                {filterColunm.map((item, key)=>(
                                    <th className={!item.show ? "filter-show__hide" : ''} key={key}>
                                        <Contextmenu
                                            triggerTitle = {trls(item.label) ? trls(item.label) : ''}
                                            addFilterColumn = {(value)=>this.addFilterColumn(value)}
                                            removeColumn = {(value)=>this.removeColumn(value)}
                                        />
                                    </th>
                                    )
                                )}
                            </tr>
                            </thead>
                            {monthEndData && !this.state.loading&&(<tbody>
                                {
                                monthEndData.map((data,i) =>(
                                    <tr id={data.id} key={i}>
                                        <td className={!this.showColumn(filterColunm[0].label) ? "filter-show__hide" : ''}>{data.ProductCode}</td>
                                        <td className={!this.showColumn(filterColunm[1].label) ? "filter-show__hide" : ''}>{Common.formatDate(data.Loadingdate)}</td>
                                        <td className={!this.showColumn(filterColunm[2].label) ? "filter-show__hide" : ''}><div style={{cursor: "pointer", color:'#004388', fontSize:"14px", fontWeight:'bold'}} onClick={()=>this.loadSalesDetail(data.salesid)}>{data.salesid}</div></td>
                                        <td className={!this.showColumn(filterColunm[3].label) ? "filter-show__hide" : ''}>
                                            {data.SalesExactBooking ? (
                                                <Row style={{width:100}}>
                                                    <i className="fas fa-check-circle order-booking__icon-active"></i>
                                                    <span className="exact-booking__number">{data.SalesExactBooking}</span>
                                                </Row>
                                            ):
                                                <Row>
                                                    <i className="fas fa-times-circle order-booking__icon-inactive"></i>
                                                    <span className="exact-booking__number"></span>
                                                </Row>
                                            }
                                        </td>
                                        <td className={!this.showColumn(filterColunm[4].label) ? "filter-show__hide" : ''}>{Common.formatMoney(data.SalesAmount)}</td>
                                        <td className={!this.showColumn(filterColunm[5].label) ? "filter-show__hide" : ''}>{data.SalesQuantity}</td>
                                        <td className={!this.showColumn(filterColunm[6].label) ? "filter-show__hide" : ''}><div style={{cursor: "pointer", color:'#004388', fontSize:"14px", fontWeight:'bold'}} onClick={()=>this.loadPurchaseDetail(data.purchaseid)}>{data.purchaseid}</div></td>
                                        <td className={!this.showColumn(filterColunm[7].label) ? "filter-show__hide" : ''}>
                                            {data.PurchseExactBooking ? (
                                                <Row style={{width:100}}>
                                                    <i className="fas fa-check-circle order-booking__icon-active"></i>
                                                    <span className="exact-booking__number">{data.PurchseExactBooking}</span>
                                                </Row>
                                            ):
                                                <Row>
                                                    <i className="fas fa-times-circle order-booking__icon-inactive"></i>
                                                    <span className="exact-booking__number"></span>
                                                </Row>
                                            }
                                        </td>
                                        <td className={!this.showColumn(filterColunm[8].label) ? "filter-show__hide" : ''}>{Common.formatMoney(data.PurchaseAmount)}</td>
                                        <td className={!this.showColumn(filterColunm[9].label) ? "filter-show__hide" : ''}>{data.PurchaseQuantity}</td>
                                        <td className={!this.showColumn(filterColunm[10].label) ? "filter-show__hide" : ''}><div style={{cursor: "pointer", color:'#004388', fontSize:"14px", fontWeight:'bold'}} onClick={()=>this.loadPurchaseDetail(data.transportid)}>{data.transportid}</div></td>
                                        <td className={!this.showColumn(filterColunm[11].label) ? "filter-show__hide" : ''}>
                                            {data.TransportExactBooking ? (
                                                <Row style={{width:100}}>
                                                    <i className="fas fa-check-circle order-booking__icon-active"></i>
                                                    <span className="exact-booking__number">{data.TransportExactBooking}</span>
                                                </Row>
                                            ):
                                                <Row>
                                                    <i className="fas fa-times-circle order-booking__icon-inactive"></i>
                                                    <span className="exact-booking__number"></span>
                                                </Row>
                                            }
                                        </td>
                                        <td className={!this.showColumn(filterColunm[12].label) ? "filter-show__hide" : ''}>{Common.formatMoney(data.TransportAmount)}</td>
                                        <td className={!this.showColumn(filterColunm[13].label) ? "filter-show__hide" : ''}>{data.TransportQuantity}</td>
                                    </tr>
                                ))
                                }
                            </tbody>)}
                        </table>

                        <table id="monthend-table-xl" className="place-and-orders__table table" width="100%" style={{display: 'none'}}>
                            <thead>
                            <tr>
                                {filterColunm.map((item, key)=>(
                                    <th className={!item.show ? "filter-show__hide" : ''} key={key}>{trls(item.label)}</th>
                                    )
                                )}
                            </tr>
                            </thead>
                            {monthEndData && !this.state.loading&&(<tbody>
                                {
                                monthEndData.map((data,i) =>(
                                    <tr id={data.id} key={i}>
                                        <td className={!this.showColumn(filterColunm[0].label) ? "filter-show__hide" : ''}>{data.ProductCode}</td>
                                        <td className={!this.showColumn(filterColunm[1].label) ? "filter-show__hide" : ''}>{Common.formatDate(data.Loadingdate)}</td>
                                        <td className={!this.showColumn(filterColunm[2].label) ? "filter-show__hide" : ''}>{data.salesid}</td>
                                        <td className={!this.showColumn(filterColunm[3].label) ? "filter-show__hide" : ''}>{Common.formatMoney(data.SalesAmount)}</td>
                                        <td className={!this.showColumn(filterColunm[4].label) ? "filter-show__hide" : ''}>{data.SalesQuantity}</td>
                                        <td className={!this.showColumn(filterColunm[5].label) ? "filter-show__hide" : ''}>
                                            {data.SalesExactBooking ? (
                                                <Row style={{width:100}}>
                                                    <i className="fas fa-check-circle order-booking__icon-active"></i>
                                                    <span className="exact-booking__number">{data.SalesExactBooking}</span>
                                                </Row>
                                            ):
                                                <Row>
                                                    <i className="fas fa-times-circle order-booking__icon-inactive"></i>
                                                    <span className="exact-booking__number"></span>
                                                </Row>
                                            }
                                        </td>
                                        <td className={!this.showColumn(filterColunm[6].label) ? "filter-show__hide" : ''}>{data.purchaseid}</td>
                                        <td className={!this.showColumn(filterColunm[7].label) ? "filter-show__hide" : ''}>{Common.formatMoney(data.PurchaseAmount)}</td>
                                        <td className={!this.showColumn(filterColunm[8].label) ? "filter-show__hide" : ''}>{data.PurchaseQuantity}</td>
                                        <td className={!this.showColumn(filterColunm[9].label) ? "filter-show__hide" : ''}>
                                            {data.PurchseExactBooking ? (
                                                <Row style={{width:100}}>
                                                    <i className="fas fa-check-circle order-booking__icon-active"></i>
                                                    <span className="exact-booking__number">{data.SalesExactBooking}</span>
                                                </Row>
                                            ):
                                                <Row>
                                                    <i className="fas fa-times-circle order-booking__icon-inactive"></i>
                                                    <span className="exact-booking__number"></span>
                                                </Row>
                                            }
                                        </td>
                                        <td className={!this.showColumn(filterColunm[10].label) ? "filter-show__hide" : ''}>{data.transportid}</td>
                                        <td className={!this.showColumn(filterColunm[11].label) ? "filter-show__hide" : ''}>{Common.formatMoney(data.TransportAmount)}</td>
                                        <td className={!this.showColumn(filterColunm[12].label) ? "filter-show__hide" : ''}>{data.TransportQuantity}</td>
                                        <td className={!this.showColumn(filterColunm[13].label) ? "filter-show__hide" : ''}>
                                            {data.TransportExactBooking ? (
                                                <Row style={{width:100}}>
                                                    <i className="fas fa-check-circle order-booking__icon-active"></i>
                                                    <span className="exact-booking__number">{data.SalesExactBooking}</span>
                                                </Row>
                                            ):
                                                <Row>
                                                    <i className="fas fa-times-circle order-booking__icon-inactive"></i>
                                                    <span className="exact-booking__number"></span>
                                                </Row>
                                            }
                                        </td>
                                    </tr>
                                ))
                                }
                            </tbody>)}
                        </table>
                        { this.state.loading&& (
                        <div className="col-md-4 offset-md-4 col-xs-12 loading" style={{textAlign:"center"}}>
                            <BallBeat
                                color={'#222A42'}
                                loading={this.state.loading}
                            />
                        </div>
                        )}
                    </div>
                </div>
                {this.state.salesNewId ? (
                    <Salesorderdetail
                        newid={this.state.salesNewId}
                        onHide={() => this.setState({slideDetailFlag: false, salesNewId: ''})}
                        customercode={this.state.customercode}
                        suppliercode={this.state.suppliercode}
                        viewDetailFlag={true}
                    />
                ): null}
                {this.state.purchaseNewId ? (
                    <Purchaseorderdetail
                        onHide={()=>this.setState({slideDetailFlag: false, purchaseNewId: ''})}
                        newId={this.state.purchaseNewId}
                        supplierCode={this.state.supplierCode}
                        viewDetailFlag={true}
                    />
                ): null}
            </div>
        )
        };
  }
  export default connect(mapStateToProps, mapDispatchToProps)(Monthendmanage);
