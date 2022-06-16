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


Highcharts.chart('container', {
    chart: {
        backgroundColor: 'white',
        events: {
            load: function () {
                // Draw the flow chart
                var ren = this.renderer,
                    colors = Highcharts.getOptions().colors,
                    rightArrow = ['M', 0, 0, 'L', 100, 0, 'L', 95, 5, 'M', 100, 0, 'L', 95, -5],
                    leftArrow = ['M', 100, 0, 'L', 0, 0, 'L', 5, 5, 'M', 0, 0, 'L', 5, -5];
                // SaaS client label
                ren.label('<center>Grid</center><br/>-> <span class="grid-import">XXXX kWh</span><br/><- <span class="grid-export">XXXX kWh</span>', 0, 82)
                    .attr({
                        fill: colors[1],
                        padding: 5,
                        r: 5
                    })
                    .css({
                        color: 'white'
                    })
                    .add()
                    .shadow(true);
                // Solar to Grid
                ren.path(leftArrow)
                    .attr({
                        'stroke-width': 2,
                        stroke: colors[3]
                    })
                    .translate(100, 95)
                    .add();
                ren.label('<span class="grid-instant-export">XXXXX Watt</span>', 110, 75)
                    .css({
                        color: 'var(--txt-color)'
                    })
                    .add();
                ren.label('Solaire<br/><span class="solar-production">XXXX kWh</span>', 210, 80)
                    .attr({
                        r: 5,
                        width: 100,
                        fill: colors[3]
                    })
                    .css({
                        color: 'white',
                        fontWeight: 'bold'
                    })
                    .add();
                // Arrow from Solair to House
                ren.path(['M', 250, 130, 'L', 250, 185, 'L', 245, 180, 'M', 250, 185, 'L', 255, 180])
                    .attr({
                        'stroke-width': 2,
                        stroke: colors[3]
                    })
                    .add();
                ren.label('<span class="solar-instant-consumption">XXXXX W</span>', 255, 145)
                    .css({
                        color: 'var(--txt-color)'
                    })
                    .add();
                ren.label('Maison<br/><span class="home-elec-consumption">XXXX kWh</span>', 210, 200)
                    .attr({
                        r: 5,
                        width: 100,
                        fill: colors[7]
                    })
                    .css({
                        color: 'white',
                        fontWeight: 'bold'
                    })
                    .add();
                // Arrow from Grid to House
                ren.path([
                        'M', 235, 185,
                        'L', 235, 155,
                        'C', 235, 130, 235, 130, 215, 130,
                        'L', 95, 130,
                        'M', 235, 185,
                        'L', 240, 180,
                        'M', 235, 185,
                        'L', 230, 180
                    ])
                    .attr({
                        'stroke-width': 2,
                        stroke: colors[1]
                    })
                    .add();
                ren.label('<span class="grid-instant-consumption">XXXXX Watt</span>', 120, 133)
                    .css({
                        color: 'var(--txt-color)'
                    })
                    .add();
                // Gas label
                ren.label('Gaz<br/><span class="gaz-consumption">XXXX m3</span>', 10, 200)
                    .attr({
                        fill: colors[8],
                        padding: 5,
                        r: 5
                    })
                    .css({
                        color: 'white',
                    })
                    .add()
                    .shadow(true);
                // Arrow from Gas to house
                ren.path(rightArrow)
                    .attr({
                        'stroke-width': 2,
                        stroke: colors[8]
                    })
                    .translate(95, 220)
                    .add();
                ren.label('<span class="gaz-instant-consumption">XXXXX L</span>', 110, 200)
                    .css({
                        color: 'var(--txt-color)'
                    })
                    .add();
                // Script label
                ren.label('Eau<br/><span class="water-consumption">XXXX m3</span>', 450, 200)
                    .attr({
                        fill: colors[0],
                        padding: 5,
                        r: 5
                    })
                    .css({
                        color: 'white',
                        width: '100px'
                    })
                    .add()
                    .shadow(true);
                // Arrow from Script to PhantomJS
                ren.path(leftArrow)
                    .attr({
                        'stroke-width': 2,
                        stroke: colors[0]
                    })
                    .translate(330, 220)
                    .add();
                ren.label('<span class="water-instant-consumption">XXXX L</span>', 360, 200)
                    .css({
                        color: 'var(--txt-color)'
                    })
                    .add();
            }
        }
    },
    title: {
        text: ''
    }
});


jeedom.cmd.update['#grid-import-id#'] = function(_options) {
    $('.eqLogic[data-eqLogic_id=#id#] .grid-import').empty().append(_options.display_value +' '+_options.unit)
}

jeedom.cmd.update['#grid-export-id#'] = function(_options) {
    $('.eqLogic[data-eqLogic_id=#id#] .grid-export').empty().append(_options.display_value +' '+_options.unit)
}

jeedom.cmd.update['#grid-instant-export-id#'] = function(_options) {
    $('.eqLogic[data-eqLogic_id=#id#] .grid-instant-export').empty().append(_options.display_value +' '+_options.unit)
}

jeedom.cmd.update['#solar-production-id#'] = function(_options) {
    $('.eqLogic[data-eqLogic_id=#id#] .solar-production').empty().append(_options.display_value +' '+_options.unit)
}

jeedom.cmd.update['#solar-instant-consumption-id#'] = function(_options) {
    $('.eqLogic[data-eqLogic_id=#id#] .solar-instant-consumption').empty().append(_options.display_value +' '+_options.unit)
}

jeedom.cmd.update['#home-elec-consumption-id#'] = function(_options) {
    $('.eqLogic[data-eqLogic_id=#id#] .home-elec-consumption').empty().append(_options.display_value +' '+_options.unit)
}

jeedom.cmd.update['#grid-instant-consumption-id#'] = function(_options) {
    $('.eqLogic[data-eqLogic_id=#id#] .grid-instant-consumption').empty().append(_options.display_value +' '+_options.unit)
}

jeedom.cmd.update['#gaz-consumption-id#'] = function(_options) {
    $('.eqLogic[data-eqLogic_id=#id#] .gaz-consumption').empty().append(_options.display_value +' '+_options.unit)
}

jeedom.cmd.update['#gaz-instant-consumption-id#'] = function(_options) {
    $('.eqLogic[data-eqLogic_id=#id#] .gaz-instant-consumption').empty().append(_options.display_value +' '+_options.unit)
}

jeedom.cmd.update['#water-consumption-id#'] = function(_options) {
    $('.eqLogic[data-eqLogic_id=#id#] .water-consumption').empty().append(_options.display_value +' '+_options.unit)
}

jeedom.cmd.update['#water-instant-consumption-id#'] = function(_options) {
    $('.eqLogic[data-eqLogic_id=#id#] .water-instant-consumption').empty().append(_options.display_value +' '+_options.unit)
}

jeedom.cmd.update['#grid-import-id#']({display_value: '#grid-import-state#', valueDate: '#grid-import-valueDate#', collectDate: '#grid-import-collectDate#',unit:'#grid-import-unite#'})

jeedom.cmd.update['#grid-import-id#']({display_value: '#grid-import-state#', valueDate: '#grid-import-valueDate#', collectDate: '#grid-import-collectDate#',unit:'#grid-import-unite#'})
jeedom.cmd.update['#grid-instant-export-id#']({display_value: '#grid-instant-export-state#', valueDate: '#grid-instant-export-valueDate#', collectDate: '#grid-instant-export-collectDate#',unit:'#grid-instant-export-unite#'})
jeedom.cmd.update['#solar-production--id#']({display_value: '#solar-production-state#', valueDate: '#solar-production-valueDate#', collectDate: '#solar-production-collectDate#',unit:'#solar-production-unite#'})
jeedom.cmd.update['#solar-instant-consumption-id#']({display_value: '#solar-instant-consumption-state#', valueDate: '#solar-instant-consumption-valueDate#', collectDate: '#solar-instant-consumption-collectDate#',unit:'#solar-instant-consumption-unite#'})
jeedom.cmd.update['#home-elec-consumption-id#']({display_value: '#home-elec-consumption-state#', valueDate: '#home-elec-consumption-valueDate#', collectDate: '#home-elec-consumption-collectDate#',unit:'#home-elec-consumption-unite#'})
jeedom.cmd.update['#grid-instant-consumption-id#']({display_value: '#grid-instant-consumption-state#', valueDate: '#grid-instant-consumption-valueDate#', collectDate: '#grid-instant-consumption-collectDate#',unit:'#grid-instant-consumption-unite#'})
jeedom.cmd.update['#gaz-consumption-id#']({display_value: '#gaz-consumption-state#', valueDate: '#gaz-consumption-valueDate#', collectDate: '#gaz-consumption-collectDate#',unit:'#gaz-consumption-unite#'})
jeedom.cmd.update['#gaz-instant-consumption-id#']({display_value: '#gaz-instant-consumption-state#', valueDate: '#gaz-instant-consumption-valueDate#', collectDate: '#gaz-instant-consumption-collectDate#',unit:'#gaz-instant-consumption-unite#'})
jeedom.cmd.update['#water-consumption-id#']({display_value: '#water-consumption-state#', valueDate: '#water-consumption-valueDate#', collectDate: '#water-consumption-collectDate#',unit:'#water-consumption-unite#'})
jeedom.cmd.update['#water-instant-consumption-id#']({display_value: '#water-instant-consumption-state#', valueDate: '#water-instant-consumption-valueDate#', collectDate: '#water-instant-consumption-collectDate#',unit:'#water-instant-consumption-unite#'})