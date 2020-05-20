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

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
    
});
class Demurragemanage extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {  
            demurrageData: [],
            filterColunm: [
                {"label": 'Id', "value": "id", "type": 'text', "show": true},
                {"label": 'Customer', "value": "Customer", "type": 'text', "show": true},
                {"label": 'Shipping_company', "value": "Rederij", "text": 'text', "show": true},
                {"label": 'Container', "value": "Container", "type": 'text', "show": true},
                {"label": 'Productcode', "value": "ProductCode", "type": 'text', "show": true},
                {"label": 'Sales_Unit', "value": "SalesUnit", "type": 'text', "show": true},
                {"label": 'Sales_Quantity', "value": "SalesQuantity", "type": 'text', "show": true},
                {"label": 'Arrival_date', "value": "Arrivaldate", "type": 'date', "show": true},
                {"label": 'PickingDate', "value": "pickingdate", "type": 'date', "show": true},
                {"label": 'RemoveReference', "value": "UithaalReferentie", "type": 'date', "show": true},
            ],
            filterData: [],
            originFilterData: [],
            slideDetailFlag: false
        };
      }
    componentDidMount() {
        this._isMounted=true
        this.getDemurrageData();
        this.setFilterData();
    }
    componentWillUnmount() {
        this._isMounted = false
    }
    getDemurrageData (data) {
        this._isMounted = true;
        this.setState({loading:true})
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetDemurrage, headers)
        .then(result => {
            if(this._isMounted){
                if(!data){
                    let itemData = result.data.Items;
                    itemData.sort(function(a, b){return new Date(a.pickingdate) - new Date(b.pickingdate)});
                    this.setState({demurrageData: itemData, originFilterData: result.data.Items});
                }else{
                    let itemData = data;
                    itemData.sort(function(a, b){return new Date(a.pickingdate) - new Date(b.pickingdate)});
                    this.setState({demurrageData: data});
                }
                this.setState({loading:false})
                $('.fitler').on( 'keyup', function () {
                    table.search( this.value ).draw();
                } );
                $('#demurrage_table').dataTable().fnDestroy();
                var table = $('#demurrage_table').DataTable(
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
            {"label": trls('Supplier'), "value": "Supplier", "type": 'text', "show": true},
            {"label": trls('Productcode'), "value": "ProductCode", "type": 'text'},
            {"label": trls('Arrival_date'), "value": "Arrivaldate", "type": 'date'},
            {"label": trls('Packing_date'), "value": "pickingdate", "date": 'text'},
        ]
        this.setState({filterData: filterData});
    }

    filterOptionData = (filterOption) =>{
        let dataA = []
        dataA = Common.filterData(filterOption, this.state.originFilterData);
        console.log('2222', dataA);
        if(!filterOption.length){
            dataA=null;
        }
        $('#demurrage_table').dataTable().fnDestroy();
        this.getDemurrageData(dataA);
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

    loadSalesDetail = (data)=>{
        this.setState({newId: data.id, slideDetailFlag: true})
    }

    render () {
        const {filterColunm, demurrageData} = this.state;
        return (
            <div className="order_div">
                <div className="content__header content__header--with-line">
                    <div id="google_translate_element"></div>
                    <h2 className="title">{trls("Demurrage")}</h2>
                </div>
                <div className="orders">
                    <Row>
                        <Col sm={6}>
                            {/* <Button variant="primary" onClick={()=>this.addProduct()}><i className="fas fa-plus add-icon"></i>{trls("Add_Product")}</Button>    */}
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
                        <table id="demurrage_table" className="place-and-orders__table table" width="100%">
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
                            {demurrageData && !this.state.loading&&(<tbody>
                                {
                                demurrageData.map((data,i) =>(
                                    <tr id={data.id} key={i}>
                                        <td className={!this.showColumn(filterColunm[0].label) ? "filter-show__hide" : ''}>
                                            <div id={data.id} style={{cursor: "pointer", color:'#004388', fontSize:"14px", fontWeight:'bold'}} onClick={()=>this.loadSalesDetail(data)}>{data.id}</div>    
                                        </td>
                                        <td className={!this.showColumn(filterColunm[1].label) ? "filter-show__hide" : ''}>{data.Customer}</td>
                                        <td className={!this.showColumn(filterColunm[2].label) ? "filter-show__hide" : ''}>{data.Rederij}</td>
                                        <td className={!this.showColumn(filterColunm[3].label) ? "filter-show__hide" : ''}>{data.Container}</td>
                                        <td className={!this.showColumn(filterColunm[4].label) ? "filter-show__hide" : ''}>{data.ProductCode}</td>
                                        <td className={!this.showColumn(filterColunm[5].label) ? "filter-show__hide" : ''}>{data.SalesUnit}</td>
                                        <td className={!this.showColumn(filterColunm[6].label) ? "filter-show__hide" : ''}>{data.SalesQuantity}</td>
                                        <td className={!this.showColumn(filterColunm[7].label) ? "filter-show__hide" : ''}>{Common.formatDate(data.Arrivaldate)}</td>
                                        <td className={!this.showColumn(filterColunm[8].label) ? "filter-show__hide" : ''}>{Common.formatDate(data.pickingdate)}</td>
                                        <td className={!this.showColumn(filterColunm[9].label) ? "filter-show__hide" : ''}>{data.UithaalReferentie}</td>
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
                {this.state.newId ? (
                    <Salesorderdetail
                        newid={this.state.newId}
                        onHide={() => this.setState({slideDetailFlag: false, newId: ''})}
                        customercode={this.state.customercode}
                        suppliercode={this.state.suppliercode}
                        viewDetailFlag={true}
                    />
                ): null}
            </div>
        )
        };
  }
  export default connect(mapStateToProps, mapDispatchToProps)(Demurragemanage);
