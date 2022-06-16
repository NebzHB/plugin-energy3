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

positionEqLogic();

$('.div_eqLogicEnergy3').each(function(){
  var container = $(this).packery({
    itemSelector: ".eqLogic-widget",
    gutter : 0,
  });
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
    loadPage(url.replace('#', ''));
  });