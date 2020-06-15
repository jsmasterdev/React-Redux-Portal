import $ from 'jquery';

export const formatDate = (startdate) => {
    var dd = new Date(startdate).getDate();
    var mm = new Date(startdate).getMonth()+1; 
    var yyyy = new Date(startdate).getFullYear();
    var formatDate = '';
    if(dd<10) 
    {
        dd='0'+dd;
    } 

    if(mm<10) 
    {
        mm='0'+mm;
    } 
    formatDate = dd+'-'+mm+'-'+yyyy;
    return formatDate;
};

export const formatDateThree = (startdate) => {
    var dd = new Date(startdate).getDate();
    var mm = new Date(startdate).getMonth()+1; 
    var yyyy = new Date(startdate).getFullYear();
    var formatDate = '';
    if(dd<10) 
    {
        dd='0'+dd;
    } 

    if(mm<10) 
    {
        mm='0'+mm;
    } 
    formatDate = yyyy+mm+dd;
    return formatDate;
};

export const formatMoney = (num) => {
    num = parseFloat(num);
    if(num){
        return (
            "€ "+num
              .toFixed(2) // always two decimal digits
              .replace('.', ',') // replace decimal point character with ,
              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') 
          ) // use . as a separator
    }else{
        return "€ 0,00" 
    }
};

export const formatQuantity = (num) => {
    if(num){
        return (
            num
              .toFixed(2) // always two decimal digits
              .replace('.', ',') // replace decimal point character with ,
              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') 
          ) // use . as a separator
    }else{
        return "0,00" 
    }
};

export const formatMoneyAmount = (num) => {
    let moneyArray = num.split('€');
    let moneyAmount = parseFloat(moneyArray[1]);
    return moneyAmount;
};

export const formatPercent = (num) => {
    if(num){
        var value = num.toFixed(2);
        return  value.toString()+" %";
    }else{
        return "0.00 %" 
    }
   
};

export const formatDateSecond = (date) =>{
    if(date){
        var dateStr = date.split('-')
        var formatDate = dateStr[1]+'/'+dateStr[0]+'/'+dateStr[2];
        return formatDate;
    }else{
        return '';
    }
}

export const formatDecimal = (data) =>{
    
    return data.replace(",", ".");
}

export const formatEasyTypeDate = (value, e) =>{
    return value;
}

export const showSlideForm = () =>{
    $(".fade-display").toggleClass("fade modal-backdrop show"); 
    return true;
}

export const hideSlideForm = () =>{
    $(".fade-display").toggleClass("fade modal-backdrop show");
    return true;
}

export const filterData = (filterOption, filterData) =>{
    let resutDat = [];
    let orResultData = [];
    filterOption.map((data, index) => {
        if(data.condition === "where") {
            if(data.type!=="date" && data.type!=="between"){
                if(data.mode==="Contains"){
                    resutDat = filterData.filter(item => String(item[data.filterOption]).toLowerCase().includes(data.value.toLowerCase()));
                }else{
                    resutDat = filterData.filter(item => String(item[data.filterOption])===data.value);
                }
            } else if(data.type==="date") {
                resutDat = filterData.filter(function(item, key) {
                    let filterDate = new Date(item[data.filterOption]);
                    let startDate = new Date(data.startDate);
                    let endDate = new Date(data.endDate);
                    filterDate = new Date(filterDate.getFullYear()+'-'+parseInt(filterDate.getMonth()+1)+'-'+filterDate.getDate());
                    startDate = new Date(startDate.getFullYear()+'-'+parseInt(startDate.getMonth()+1)+'-'+startDate.getDate());
                    endDate = new Date(endDate.getFullYear()+'-'+parseInt(endDate.getMonth()+1)+'-'+endDate.getDate());
                    return filterDate>=startDate && filterDate<=endDate;
                })
            }else {
                resutDat = filterData.filter(function(item, key) {
                    let filterDate = new Date(item[data.filterOption]);
                    return Number(filterDate)>=Number(data.startValue) && Number(filterDate)<=Number(data.endValue);
                })
            }
        }else if(data.condition === "And"){
            if(data.type!=="date" && data.type!=="between"){
                if(data.mode==="Contains"){
                    resutDat = resutDat.filter(item => String(item[data.filterOption]).toLowerCase().includes(data.value.toLowerCase()));
                }else{
                    resutDat = resutDat.filter(item => String(item[data.filterOption])===data.value);
                }
            } else if(data.type==="date") {
                resutDat = filterData.filter(function(item, key) {
                    let filterDate = new Date(item[data.filterOption]);
                    let startDate = new Date(data.startDate);
                    let endDate = new Date(data.endDate);
                    filterDate = new Date(filterDate.getFullYear()+'-'+parseInt(filterDate.getMonth()+1)+'-'+filterDate.getDate());
                    startDate = new Date(startDate.getFullYear()+'-'+parseInt(startDate.getMonth()+1)+'-'+startDate.getDate());
                    endDate = new Date(endDate.getFullYear()+'-'+parseInt(endDate.getMonth()+1)+'-'+endDate.getDate());
                    return filterDate>=startDate && filterDate<=endDate;
                })
            } else {
                resutDat = filterData.filter(function(item, key) {
                    let filterDate = new Date(item[data.filterOption]);
                    return Number(filterDate)>=Number(data.startValue) && Number(filterDate)<=Number(data.endValue);
                })
            }
        }else{
            if(data.type!=="date" && data.type!=="between"){
                if(data.mode==="Contains"){
                    orResultData = filterData.filter(item => String(item[data.filterOption]).toLowerCase().includes(data.value.toLowerCase()));
                }else{
                    orResultData = filterData.filter(item => String(item[data.filterOption])===data.value);
                }
            } else if(data.type==="date") {
                orResultData = filterData.filter(function(item, key) {
                    let filterDate = new Date(item[data.filterOption]);
                    let startDate = new Date(data.startDate);
                    let endDate = new Date(data.endDate);
                    filterDate = new Date(filterDate.getFullYear()+'-'+parseInt(filterDate.getMonth()+1)+'-'+filterDate.getDate());
                    startDate = new Date(startDate.getFullYear()+'-'+parseInt(startDate.getMonth()+1)+'-'+startDate.getDate());
                    endDate = new Date(endDate.getFullYear()+'-'+parseInt(endDate.getMonth()+1)+'-'+endDate.getDate());
                    return filterDate>=startDate && filterDate<=endDate;
                })
            } else {
                orResultData = filterData.filter(function(item, key) {
                    let filterDate = new Date(item[data.filterOption]);
                    return Number(filterDate)>=Number(data.startValue) && Number(filterDate)<=Number(data.endValue);
                })
            }
            resutDat = resutDat.concat(orResultData) 
            resutDat.splice(0, resutDat.length, ...(new Set(resutDat)))
        }
        return data;
    })
    return resutDat;
}
