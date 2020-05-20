import React, {Component} from 'react'
import { connect } from 'react-redux';
import { Button, Form, Col, Row } from 'react-bootstrap';
import  Purchaseform  from './purchaseform'
import { BallBeat } from 'react-pure-loaders';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import { trls } from '../../components/translate';
import 'datatables.net';
import $ from 'jquery';
import * as Common from '../../components/common';
import Purchaseorderdetail from './purchaseorder_detail';
import Filtercomponent from '../../components/filtercomponent';
import Contextmenu from '../../components/contextmenu';
import SweetAlert from 'sweetalert';

const mapStateToProps = state => ({
     ...state.auth,
});

const mapDispatchToProps = dispatch => ({

}); 

class Purchaseorder extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {  
            purhaseorders:[],
            loading:true,
            slideFormFlag: false,
            slideDetailFlag: false,
            filterData: [],
            originpurchaseorders: [],
            filterFlag: false,
            filterColunm: [
                {"label": 'Id', "value": "Id", "type": 'text', "show": true},
                {"label": 'Supplier', "value": "Supplier", "type": 'text', "show": true},
                {"label": 'Invoice', "value": "invoicenr", "type": 'text', "show": true},
                {"label": 'Invoice_date', "value": "invoicedate", "type": 'date', "show": true},
                {"label": 'IsTransport', "value": "IsTransport", "type": 'text', "show": true},
                {"label": 'Total_amount', "value": "total", "type": 'text', "show": true},
                {"label": 'ExactBooking', "value": "ExactBooking", "type": 'text', "show": true},
                {"label": 'Action', "value": "Action", "type": 'text', "show": true},
            ],
            packingFilterNum: '',
            obj: this
        };
    }
    componentDidMount() {
        this.getPurchaseOrders();
        this.setFilterData();
        let obj = this.state.obj;
        $("#packing-filter").keyup(function(event) {
            if (event.keyCode === 13) {
                obj.getPurchaseOrders();
            }
        });
    }

    componentWillUnmount() {
    }
    getPurchaseOrders(data) {
        const { packingFilterNum } = this.state;
        this.setState({loading: true})
        var headers = SessionManager.shared().getAuthorizationHeader();
        let params = {
            pakbon: packingFilterNum
        }
        Axios.post(API.GetPurchaseOrders, params, headers)
        .then(result => {
            if(!data){
                this.setState({purhaseorders: result.data.Items, originpurchaseorders: result.data.Items});
            }else{
                this.setState({purhaseorders: data});
            }
            this.setState({loading: false})
            $('.fitler').on( 'keyup', function () {
                table.search( this.value ).draw();
            } );
            $('#example').dataTable().fnDestroy();
            var table = $('#example').DataTable(
                {
                    "language": {
                        "lengthMenu": trls("Show")+" _MENU_ "+trls("Result_on_page"),
                        "zeroRecords": "Nothing found - sorry",
                        "info": trls("Show_page")+" _PAGE_ "+trls('Results_of')+" _PAGES_",
                        "infoEmpty": "No records available",
                        "infoFiltered": "(filtered from _MAX_ total records)",
                        "search": trls('Search'),
                        "paginate": {
                        "previous": trls('Previous'),
                        "next": trls('Next')
                        }
                    },
                    "dom": 't<"bottom-datatable" lip>',
                    "order": [[ 0, "desc" ]]
                }
            );
        });
    }

    loadPurchaseDetail = (id) =>{
        this.setState({newId: id, supplierCode: '', newSubmit: true, slideDetailFlag: true});
        Common.showSlideForm();
    }

    addPurchase = () => {
        this.setState({copyProduct: '', copyFlag: 1, slideFormFlag: true});
        Common.showSlideForm();
    }
    // filter module
    setFilterData = () => {
        let filterData = [
            {"label": trls('Supplier'), "value": "Supplier", "type": 'text'},
            {"label": trls('Invoice'), "value": "invoicenr", "type": 'text'},
            {"label": trls('Pakbon'), "value": "pakbon ", "type": 'text'},
            {"label": trls('Invoice_date'), "value": "invoicedate", "type": 'date'},
            {"label": trls('Totalamount'), "value": "total", "type": 'text'}
        ]
        this.setState({filterData: filterData});
    }

    filterOptionData = (filterOption) =>{
        let dataA = []
        dataA = Common.filterData(filterOption, this.state.originpurchaseorders);
        if(!filterOption.length){
            dataA=null;
        }
        $('#example').dataTable().fnDestroy();
        this.getPurchaseOrders(dataA);
    }

    changeFilter = () => {
        if(this.state.filterFlag){
            this.setState({filterFlag: false})
        }else{
            this.setState({filterFlag: true})
        }
    }
    // filter module

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

    deletePurchaseOrder = (id) => {
        let params = {
            id: id
        }
        var header = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.DeletePurchaseOrder, params, header)
        .then(result=>{
            if(result.data.Success){
                SweetAlert({
                    title: trls('Success'),
                    icon: "success",
                    button: "OK",
                });
                this.getPurchaseOrders();
            }
        })
    }

    render () {
        let salesData = this.state.purhaseorders;
        const {filterColunm} = this.state;
        return (
            <div className="order_div">
                <div className="content__header content__header--with-line">
                    <h2 className="title">{trls('Purchase_Order')}</h2>
                </div>
                <div className="orders">
                    <Row>
                        <Col sm={6}>
                            <Button variant="primary" onClick={()=>this.addPurchase()}><i className="fas fa-plus add-icon"></i>{trls('Add_Pursase_Order')}</Button>  
                        </Col>
                        <Col sm={6} className="has-search">
                            <div style={{display: 'flex', float: 'right'}}>
                                <div style={{marginRight: 20}}>
                                    <i className="fas fa-filter form-control-feedback"></i>
                                    <Form.Control id="packing-filter" className="form-control" type="text" placeholder={trls("PackingFilter")} onChange={(evt)=>this.setState({packingFilterNum: evt.target.value})}/>
                                </div>
                                <Button variant="light" onClick={()=>this.changeFilter()}><i className="fas fa-filter add-icon"></i>{trls('Filter')}</Button>
                                <div style={{marginLeft: 20}}>
                                    <span className="fa fa-search form-control-feedback"></span>
                                    <Form.Control className="form-control fitler" type="text" placeholder={trls("Quick_search")}/>
                                </div>
                            </div>
                        </Col>
                        {this.state.filterData.length&&(
                            <Filtercomponent
                                onHide={()=>this.setState({filterFlag: false})}
                                filterData={this.state.filterData}
                                onFilterData={(filterOption)=>this.filterOptionData(filterOption)}
                                showFlag={this.state.filterFlag}
                            />
                        )}
                    </Row>
                    <div className="table-responsive purchase-order-table">
                        <table id="example" className="place-and-orders__table table" width="100%">
                            <thead>
                                <tr>
                                    {filterColunm.map((item, key)=>(
                                        <th className={!item.show ? "filter-show__hide" : ''} key={key} style={item.value==="ExactBooking" ? {width: 30} : {}}>
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
                            {salesData && !this.state.loading &&(<tbody>
                                {
                                salesData.map((data,i) =>(
                                    <tr id={data.id} key={i}>
                                        <td className={!this.showColumn(filterColunm[0].label) ? "filter-show__hide" : ''}><div id={data.id} style={{cursor: "pointer", color:'#004388', fontSize:"14px", fontWeight:'bold'}} onClick={()=>this.loadPurchaseDetail(data.id)}>{data.id}</div></td>
                                        <td className={!this.showColumn(filterColunm[1].label) ? "filter-show__hide" : ''}>
                                            {data.Supplier}
                                        </td>
                                        <td className={!this.showColumn(filterColunm[2].label) ? "filter-show__hide" : ''}>{data.invoicenr}</td>
                                        <td className={!this.showColumn(filterColunm[3].label) ? "filter-show__hide" : ''}>{Common.formatDate(data.invoicedate)}</td>
                                        
                                        <td className={!this.showColumn(filterColunm[4].label) ? "filter-show__hide" : ''}>
                                            {data.istransport ? (
                                                <i className ="fas fa-check-circle active-icon"></i>
                                            ):
                                                <i className ="fas fa-times-circle inactive-icon"></i>
                                            }
                                        </td>
                                        <td className={!this.showColumn(filterColunm[5].label) ? "filter-show__hide" : ''}>{Common.formatMoney(data.total)}</td>
                                        <td className={!this.showColumn(filterColunm[6].label) ? "filter-show__hide" : ''} style={{width: 100}}>
                                            {data.exactBooking ? (
                                                <Row>
                                                    <i className="fas fa-check-circle order-booking__icon-active"></i>
                                                    <span className="exact-booking__number">{data.exactBooking}</span>
                                                </Row>
                                            ):
                                                <Row>
                                                    <i className="fas fa-times-circle order-booking__icon-inactive"></i>
                                                    <span className="exact-booking__number"></span>
                                                </Row>
                                            }
                                        </td>
                                        <td className={!this.showColumn(filterColunm[7].label) ? "filter-show__hide" : ''}>
                                            <Row style={{width: 80}}>
                                                {!data.exactBooking ? (
                                                    <Button variant="light" onClick={()=>this.deletePurchaseOrder(data.id)} className="action-button"><i className="fas fa-trash-alt add-icon"></i>{trls('Delete')}</Button>
                                                ):
                                                    <Button variant="light" onClick={()=>this.deletePurchaseOrder(data.id)} disabled className="action-button"><i className="fas fa-trash-alt add-icon"></i>{trls('Delete')}</Button>
                                                }
                                            </Row>
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
                {this.state.slideFormFlag ? (
                    <Purchaseform
                        show={this.state.modalShow}
                        onHide={() => this.setState({slideFormFlag: false})}
                        onloadPurchaseDetail={(purchaseId) => this.loadPurchaseDetail(purchaseId)}
                    />
                ): null}
                {this.state.slideDetailFlag ? (
                    <Purchaseorderdetail
                        onHide={()=>this.setState({slideDetailFlag: false})}
                        newId={this.state.newId}
                        supplierCode={this.state.supplierCode}
                        onGetgetPurchaseOrders={()=>this.getPurchaseOrders()}
                    />
                ): null}
            </div>
            
        )
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Purchaseorder);
