<?php
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

/* * ***************************Includes********************************* */
require_once __DIR__  . '/../../../../core/php/core.inc.php';

class energy3 extends eqLogic {
  /*     * *************************Attributs****************************** */

  private static $_listen_cmd = array('elec::import', 'elec::consumption', 'elec::production::instant', 'elec::production', 'elec::export', 'gaz::consumption::instant', 'gaz::consumption', 'water::consumption::instant', 'water::consumption', 'elec::net::power');

  /*     * ***********************Methode static*************************** */


  public static function listenner($_options) {
    $eqLogic = energy3::byId($_options['energy3_id']);
    if (!is_object($eqLogic)) {
      return;
    }
    foreach (self::$_listen_cmd as $key) {
      if ($eqLogic->getConfiguration($key) == '') {
        continue;
      }
      if (strpos($eqLogic->getConfiguration($key), '#' . $_options['event_id'] . '#') !== false) {
        if ($key == 'elec::net::power') {
          $eqLogic->calculImportExport();
        } else {
          $eqLogic->checkAndUpdateCmd($key, jeedom::evaluateExpression($eqLogic->getConfiguration($key)));
        }
      }
    }
    $eqLogic->calculPerformance();
  }


  /*     * *********************Méthodes d'instance************************* */
  public function calculImportExport() {
    $net_power = jeedom::evaluateExpression($this->getConfiguration('elec::net::power'));
    $elec_production = jeedom::evaluateExpression($this->getConfiguration('elec::production::instant'));
    if ($net_power > 0) {
      $this->checkAndUpdateCmd('elec::import::instant', $net_power);
      $this->checkAndUpdateCmd('elec::export::instant', 0);
    } else {
      $this->checkAndUpdateCmd('elec::import::instant', 0);
      $this->checkAndUpdateCmd('elec::export::instant', -$net_power);
    }
    if ($elec_production > 0) {
      $this->checkAndUpdateCmd('elec::production::consumption::instant', $elec_production + $net_power);
    } else {
      $this->checkAndUpdateCmd('elec::production::consumption::instant', 0);
    }
    $this->checkAndUpdateCmd('elec::consumption::instant', $elec_production + $net_power);
  }

  public function calculPerformance() {
    $production = $this->getCmd('info', 'elec::production')->execCmd();
    $export = $this->getCmd('info', 'elec::export')->execCmd();
    $consumption = $this->getCmd('info', 'elec::consumption')->execCmd();
    $this->checkAndUpdateCmd('elec::autoconsumption', round((($production - $export) / $production) * 100, 1));
    $this->checkAndUpdateCmd('elec::selfsufficiency', round((($production - $export) / $consumption) * 100, 1));
  }


  public function toHtml($_version = 'dashboard') {
    $replace = $this->preToHtml($_version);
    if (!is_array($replace)) {
      return $replace;
    }
    $version = jeedom::versionAlias($_version);
    $replace['#version#'] = $_version;
    foreach ($this->getCmd('info') as $cmd) {
      $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-id#'] = $cmd->getId();
      $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-state#'] = $cmd->execCmd();
      if ($replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-state#'] == '') {
        $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-state#'] = 0;
      }
      $valueInfo = cmd::autoValueArray($replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-state#'], 2, $cmd->getUnite());
      $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-state#'] = $valueInfo[0];
      $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-valueDate#'] = $cmd->getValueDate();
      $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-collectDate#'] = $cmd->getCollectDate();
      $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-unite#'] = $valueInfo[1];
    }
    return $this->postToHtml($_version, template_replace($replace, getTemplate('core', $version, 'eqLogic', __CLASS__)));
  }

  public function postSave() {
    $cmds = json_decode(file_get_contents(__DIR__ . '/../config/cmd.json'), true);
    foreach ($cmds as $key => $cmd_info) {
      $cmd = $this->getCmd(null, $key);
      if (!is_object($cmd)) {
        $cmd = new energy3Cmd();
        $cmd->setIsVisible($cmds[$key]['isVisible']);
        $cmd->setUnite($cmds[$key]['unite']);
        $cmd->setName($cmds[$key]['name']);
        $cmd->setIsHistorized($cmds[$key]['isHistorized']);
        $cmd->setConfiguration('historizeRound', 2);
      }
      $cmd->setLogicalId($key);
      $cmd->setEqLogic_id($this->getId());
      $cmd->setType($cmds[$key]['type']);
      $cmd->setSubType($cmds[$key]['subtype']);
      $cmd->save();
    }
    $events = array();
    foreach (self::$_listen_cmd as $key) {
      if ($this->getConfiguration($key) != '') {
        preg_match_all("/#([0-9]*)#/", $this->getConfiguration($key), $matches);
        foreach ($matches[1] as $cmd_id) {
          $events[] = $cmd_id;
        }
        if (isset($cmds[$key])) {
          $cmd = $this->getCmd(null, $key);
          if (is_object($cmd)) {
            $cmd->event(jeedom::evaluateExpression($this->getConfiguration($key)));
          }
        }
      }
    }

    $listener = listener::byClassAndFunction(__CLASS__, 'listenner', array('energy3_id' => intval($this->getId())));
    if (!is_object($listener)) {
      $listener = new listener();
    }
    $listener->setClass('energy3');
    $listener->setFunction('listenner');
    $listener->setOption(array('energy3_id' => intval($this->getId())));
    $listener->emptyEvent();
    foreach ($events as $cmd_id) {
      $listener->addEvent($cmd_id);
    }
    $listener->save();
    $this->calculImportExport();
    $this->calculPerformance();
  }

  public function generatePanel($_version = 'dashboard', $_period = 'd') {
    $cmds = array();
    foreach (self::$_listen_cmd as $key) {
      $cmds[$key] = $this->getCmd(null, $key);
    }
    $return = array();
    $return['table'] = '<table class="table table-bordered table-condensed">';
    $return['table'] .= '<thead>';
    $return['table'] .= '<tr><th></th><th>Actuel</th><th>Consommation</th><th>Coût</th></tr>';
    $return['table'] .= '</thead>';
    $return['table'] .= '<tbody>';
    $return['table'] .= '<tr><td>Electricité</td><td>' . $cmds['consumption::instant']->execCmd() . 'W</td>' . $cmds['consumption::byday']->execCmd() . 'kWh<td></td><td>' . $cmds['consumption::cost']->execCmd() . '€</td></tr>';
    $return['table'] .= '<tr><td>Production</td><td>' . $cmds['production::instant']->execCmd() . 'W</td>' . $cmds['production::byday']->execCmd() . 'kWh<td></td><td></td></tr>';
    $return['table'] .= '<tr><td>Gaz</td><td>' . $cmds['gaz::instant']->execCmd() . 'L</td><td>' . $cmds['gaz::byday']->execCmd() . 'L</td><td>' . $cmds['gaz::cost']->execCmd() . '€</td></tr>';
    $return['table'] .= '<tr><td>Eau</td><td>' . $cmds['water::instant']->execCmd() . 'L</td><td>' . $cmds['water::byday']->execCmd() . 'L</td><td>' . $cmds['water::cost']->execCmd() . '€</td></tr>';
    $return['table'] .= '</tbody>';
    $return['table'] .= '</table>';

    return $return;
  }


  /*     * **********************Getteur Setteur*************************** */
}

class energy3Cmd extends cmd {
  /*     * *************************Attributs****************************** */


  /*     * ***********************Methode static*************************** */


  /*     * *********************Methode d'instance************************* */


  // Exécution d'une commande
  public function execute($_options = array()) {
  }

  /*     * **********************Getteur Setteur*************************** */
}
