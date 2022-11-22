/* This file is part of Jeedom.
*
* Jeedom is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Jeedom is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
*/

jeedomUtils.positionEqLogic();

$('.div_eqLogicEnergy3').each(function(){
  var container = $(this).packery({isLayoutInstant: true});
});
$('.div_eqLogicEnergy3 .eqLogic-widget').trigger('resize');


$('.bt_changePeriod').on('click',function(){
    var url = document.URL
    var newAdditionalURL = '';
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var aditionalURL = tempArray[1];
    var temp = '';
    if(aditionalURL)  {
      var tempArray = aditionalURL.split('&');
      for ( var i in tempArray ){
        if(tempArray[i].indexOf('period') == -1){
          newAdditionalURL += temp+tempArray[i];
          temp = "&";
        }
      }
    }
    jeedom.history.chart = [];
    var url = baseURL+'?'+newAdditionalURL+temp+'period='+$(this).attr('data-period')
    jeedomUtils.loadPage(url.replace('#', ''));
});

var graphOption = {
  showNavigator : false,
  showLegend : true,
  showScrollbar : true,
  showTimeSelector : true,
  disablePlotBand : true,
  pointWidth : 30,
  allowFuture : true,
  option : {displayAlert:false}
}

function initGraph(){
  
  graphOption.dateStart = energy3data.datetime.start;
  graphOption.dateEnd = energy3data.datetime.end;
  graphOption.option.graphScale = 0;
  
  if(energy3data.datetime.period == 'D' || energy3data.datetime.period == 'D-1' ){
    graphOption.el = 'div_energy3GraphConsumptionProduction';
    graphOption.cmd_id = energy3data.cmd['elec::consumption::instant'].id;
    graphOption.option = {displayAlert:false,graphColor:'#b56926',name : 'Consommation',graphType : 'column',groupingType : 'avg::hour',graphStack : true,invertData : true}

    var options = JSON.parse(JSON.stringify(graphOption));
    options.success = function(){
      graphOption.el = 'div_energy3GraphConsumptionProduction';
      graphOption.cmd_id = energy3data.cmd['elec::production::instant'].id;
      graphOption.option = {displayAlert:false,graphColor:'#7ea823',name : 'Production',graphType : 'column',groupingType : 'avg::hour',graphStack: true}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
  
      graphOption.cmd_id = energy3data.cmd['elec::import::instant'].id;
      graphOption.option = {displayAlert:false,graphColor:'#283747',name : 'Import',graphType : 'column',groupingType : 'avg::hour',graphStack: true}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
  
      graphOption.cmd_id = energy3data.cmd['elec::export::instant'].id;
      graphOption.option = {displayAlert:false,graphColor:'#616A6B',name : 'Export',graphType : 'column',groupingType : 'avg::hour',graphStack: true,invertData : true}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    }
    jeedom.history.drawChart(options);

    if(energy3data.cmd['gaz::consumption::instant']){
      graphOption.el = 'div_energy3GraphGas';
      graphOption.cmd_id = energy3data.cmd['gaz::consumption::instant'].id;
      graphOption.pointWidth = 1;
      graphOption.option = {displayAlert:false,graphColor:'#910000',name : 'Consommation',graphType : 'column'}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    }else{
      $('#div_energy3GraphGas').parent().remove();
    }
    
    if(energy3data.cmd['water::consumption::instant']){
      graphOption.el = 'div_energy3GraphWater';
      graphOption.cmd_id = energy3data.cmd['water::consumption::instant'].id;
      graphOption.pointWidth = 1;
      graphOption.option = {displayAlert:false,graphColor:'#2f7ed8',name : 'Consommation',graphType : 'column'}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    }else{
      $('#div_energy3GraphWater').parent().remove();
    }

    graphOption.dateEnd = energy3data.datetime.end_1;
    graphOption.pointWidth = 10;
    graphOption.el = 'div_energy3GraphForecast';
    graphOption.cmd_id = energy3data.cmd['solar::forecast::now::power'].id;
    graphOption.option = {displayAlert:false,graphColor:'#FBC02D',name : 'Prévision',graphType : 'line',groupingType : 'avg::hour',allowFuture:1}

    var options = JSON.parse(JSON.stringify(graphOption));
    options.success = function(){
      graphOption.el = 'div_energy3GraphForecast';
      graphOption.cmd_id = energy3data.cmd['elec::production::instant'].id;
      graphOption.option = {displayAlert:false,graphColor:'#7ea823',name : 'Production',graphType : 'column',groupingType : 'avg::hour',graphStack: true}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    };
    jeedom.history.drawChart(options);
  }else{
    graphOption.el = 'div_energy3GraphElecAuto';
    graphOption.cmd_id = energy3data.cmd['elec::selfsufficiency'].id;
    graphOption.option = {displayAlert:false,name : 'Auto-suffisance',graphType : 'column',groupingType : 'avg::day'}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    graphOption.cmd_id = energy3data.cmd['elec::autoconsumption'].id;
    graphOption.option = {displayAlert:false,name : 'Auto-consommation',graphType : 'column',groupingType : 'avg::day'}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    
    graphOption.el = 'div_energy3GraphConsumptionProduction';
    graphOption.cmd_id = energy3data.cmd['elec::consumption'].id;
    graphOption.option = {displayAlert:false,graphColor:'#b56926',name : 'Consommation',graphType : 'column',graphStack: true,invertData : true}
    var options = JSON.parse(JSON.stringify(graphOption));
    options.success = function(){
      graphOption.el = 'div_energy3GraphConsumptionProduction';
      graphOption.cmd_id = energy3data.cmd['elec::production'].id;
      graphOption.option = {displayAlert:false,graphColor:'#7ea823',name : 'Production',graphType : 'column',graphStack: true}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));

      graphOption.cmd_id = energy3data.cmd['elec::import'].id;
      graphOption.option = {displayAlert:false,graphColor:'#283747',name : 'Import',graphType : 'column',graphStack: true}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));

      graphOption.cmd_id = energy3data.cmd['elec::export'].id;
      graphOption.option = {displayAlert:false,graphColor:'#616A6B',name : 'Export',graphType : 'column',graphStack: true,invertData : true}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    }
    jeedom.history.drawChart(options);

    if(energy3data.cmd['gaz::consumption']){
      graphOption.el = 'div_energy3GraphGas';
      graphOption.cmd_id = energy3data.cmd['gaz::consumption'].id;
      graphOption.option = {displayAlert:false,graphColor:'#910000',name : 'Consommation',graphType : 'column',groupingType : 'max::day'}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    }else{
      $('#div_energy3GraphWater').parent().remove();
    }

    if(energy3data.cmd['water::consumption']){
      graphOption.el = 'div_energy3GraphWater';
      graphOption.cmd_id = energy3data.cmd['water::consumption'].id;
      graphOption.option = {displayAlert:false,graphColor:'#2f7ed8',name : 'Consommation',graphType : 'column',groupingType : 'max::day'}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    }else{
      $('#div_energy3GraphWater').parent().remove();
    }
  }
}


initGraph();