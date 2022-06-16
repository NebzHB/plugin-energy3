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


  public static $_period = array(
    'D' => array(
      'name' => 'J',
      'start' => 'midnight',
      'end' => 'tomorrow midnight -1 second',
    ),
    'D-1' => array(
      'name' => 'J-1',
      'start' => '-1 day midnight +1 second',
      'end' => 'today midnight -1 second',
    ),
    'W' => array(
      'name' => 'S',
      'start' => 'monday this week midnight',
      'end' => 'sunday 23:59:59',
    ),
    'W-1' => array(
      'name' => 'S-1',
      'start' => 'monday this week midnight -7 days',
      'end' => 'last sunday 23:59:59',
    ),
    'M' => array(
      'name' => 'M',
      'start' => 'first day of this month midnight',
      'end' => 'last day of this month 23:59:59',
    ),
    'M-1' => array(
      'name' => 'M-1',
      'start' => 'first day of previous month midnight',
      'end' => 'last day of previous month 23:59:59',
    ),
    'Y' => array(
      'name' => 'A',
      'start' => 'first day of january this year midnight',
      'end' => 'last day of december this year 23:59:59',
    ),
    'Y-1' => array(
      'name' => 'A-1',
      'start' => 'first day of january last year midnight',
      'end' => 'last day of december last year 23:59:59',
    ),
  );

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
        $cmd->setIsVisible($cmd_info['isVisible']);
        $cmd->setUnite($cmd_info['unite']);
        $cmd->setName($cmd_info['name']);
        $cmd->setIsHistorized($cmd_info['isHistorized']);
        $cmd->setConfiguration('historizeRound', 2);
      }
      $cmd->setLogicalId($key);
      $cmd->setEqLogic_id($this->getId());
      $cmd->setType($cmd_info['type']);
      $cmd->setSubType($cmd_info['subtype']);
      $cmd->save();
    }
    $events = array();
    foreach (self::$_listen_cmd as $key) {
      if ($this->getConfiguration($key) != '') {
        preg_match_all("/#([0-9]*)#/", $this->getConfiguration($key), $matches);
        foreach ($matches[1] as $cmd_id) {
          $events[] = $cmd_id;
        }
        $cmd = $this->getCmd(null, $key);
        if (is_object($cmd)) {
          $cmd->event(jeedom::evaluateExpression($this->getConfiguration($key)));
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

  public function generatePanel($_version = 'dashboard', $_period = 'D') {
    $return = array('widget' => '');
    if ($_period == '') {
      $_period = 'D';
    }
    $starttime = date('Y-m-d H:i:s', strtotime(self::$_period[$_period]['start']));
    $endtime = date('Y-m-d H:i:s', strtotime(self::$_period[$_period]['end']));
    config::save('savePeriod', $_period, 'energy2');
    $return['html'] = '<center>';
    foreach (self::$_period as $key => $value) {
      if ($_period == $key) {
        $return['html'] .= '<a class="btn btn-success ui-btn-raised ui-btn-inline bt_changePeriod" data-period="' . $key . '">' . $value['name'] . '</a> ';
      } else {
        $return['html'] .= '<a class="btn btn-default ui-btn ui-mini ui-btn-inline bt_changePeriod" data-period="' . $key . '">' . $value['name'] . '</a> ';
      }
    }
    $return['html'] .= '</center>';
    if ($_version == 'dashboard') {
      $return['html'] .= '<div class="row">';
      $return['html'] .= '<div class="col-lg-5 col-sm-6 col-xs-6 div_eqLogicEnergy3">';
    }
    if ($_period == 'D') {
      $return['html'] .= $this->toHtml($_version);
    } else {
      $replace = $this->preToHtml($_version);
      $version = jeedom::versionAlias($_version);
      $replace['#version#'] = $_version;
      foreach ($this->getCmd('info') as $cmd) {
        if (in_array($cmd->getLogicalId(), array('elec::production::instant', 'gaz::consumption::instant', 'water::consumption::instant', 'elec::net::power', 'elec::import::instant', 'elec::export::instant', 'elec::production::consumption::instant'))) {
          $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-id#'] = $cmd->getLogicalId();
          $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-state#'] = '';
          $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-valueDate#'] = '';
          $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-collectDate#'] = '';
          $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-unite#'] = '';
          continue;
        }
        $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-id#'] = $cmd->getLogicalId();
        if (in_array($cmd->getLogicalId(), array('elec::autoconsumption', 'elec::selfsufficiency'))) {
          $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-state#'] = $this->getValueForPeriod($cmd->getId(), 'AVG', $starttime, $endtime);
        } else {
          $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-state#'] = $this->getValueForPeriod($cmd->getId(), 'SUM', $starttime, $endtime);
        }
        if ($replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-state#'] == '') {
          $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-state#'] = 0;
        }
        $valueInfo = cmd::autoValueArray($replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-state#'], 2, $cmd->getUnite());
        $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-state#'] = $valueInfo[0];
        $replace['#' . str_replace('::', '-', $cmd->getLogicalId()) . '-unite#'] = $valueInfo[1];
      }
      $replace['#refresh_id#'] = '';
      $return['html'] .= $this->postToHtml($_version, template_replace($replace, getTemplate('core', $version, 'eqLogic', __CLASS__)));
    }
    if ($_version == 'dashboard') {
      $return['html'] .= '</div>';
      $return['html'] .= '<div class="col-lg-7 col-sm-6 col-xs-6">';
      $return['html'] .= '</div>';
      $return['html'] .= '</div>';
    }
    return $return;
  }

  public function getValueForPeriod($_cmd_id, $_type, $_startTime, $_endTime) {
    $values = array(
      'cmd_id' => $_cmd_id,
      'startTime' => $_startTime,
      'endTime' => $_endTime,
    );
    $sql = 'SELECT ' . $_type . '(CAST(value AS DECIMAL(12,2))) as result
		FROM (
			SELECT *
			FROM history
			WHERE cmd_id=:cmd_id
      AND `datetime` IN (
        SELECT MAX(`datetime`)
        FROM history
        WHERE cmd_id=:cmd_id
			    AND `datetime`>=:startTime
			    AND `datetime`<=:endTime
        GROUP BY date(`datetime`)
      )
			GROUP BY date(`datetime`)
			UNION ALL
			SELECT *
			FROM historyArch
			WHERE cmd_id=:cmd_id
			AND `datetime` IN (
        SELECT MAX(`datetime`)
        FROM historyArch
        WHERE cmd_id=:cmd_id
			    AND `datetime`>=:startTime
			    AND `datetime`<=:endTime
        GROUP BY date(`datetime`)
      )
		) as dt';
    $result = DB::Prepare($sql, $values, DB::FETCH_TYPE_ROW);
    return $result['result'];
  }


  /*     * **********************Getteur Setteur*************************** */
}

class energy3Cmd extends cmd {
  /*     * *************************Attributs****************************** */


  /*     * ***********************Methode static*************************** */


  /*     * *********************Methode d'instance************************* */


  // Exécution d'une commande
  public function execute($_options = array()) {
    $eqLogic = $this->getEqLogic();
    if ($this->getLogicalId() == 'refresh') {
      preg_match_all("/#([0-9]*)#/", $eqLogic->getConfiguration('refresh'), $matches);
      foreach ($matches[1] as $cmd_id) {
        $cmd = cmd::byId($cmd_id);
        if (is_object($cmd)) {
          $cmd->execCmd();
        }
      }
    }
  }

  /*     * **********************Getteur Setteur*************************** */
}
