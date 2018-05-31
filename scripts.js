jQuery(document).ready(function() {

  var gameIDs = [];
  var gameData = [];
  var activeGame;
  var activeGameInterval;

  var round;
  var standings = '';
  jQuery.getJSON("https://data.nba.com/data/v2015/json/mobile_teams/nba/2017/scores/00_playoff_bracket.json", function(data) {

    if (data.pb.r.length === 1) {
      round = data.pb.r[0].d;
      data.pb.r[0].co.forEach(function(v) {

        v.ser.forEach(function(v) {
          if (v.tn1 === "Trail Blazers" || v.tn2 === "Trail Blazers") {
            standings = v.seri;
            jQuery("#standings").html(round + ': ' + standings);
          }
        });
      });
    }
    if (data.pb.r.length === 2) {
      round = data.pb.r[1].d;
      data.pb.r[1].co.forEach(function(v) {

        v.ser.forEach(function(v) {
          if (v.tn1 === "Trail Blazers" || v.tn2 === "Trail Blazers") {
            standings = v.seri;
            jQuery("#standings").html('West ' + round + ': ' + standings);
          }
        });
      });
    }
    if (data.pb.r.length === 3) {
      round = data.pb.r[2].d;
      data.pb.r[2].co.forEach(function(v) {

        v.ser.forEach(function(v) {
          if (v.tn1 === "Trail Blazers" || v.tn2 === "Trail Blazers") {
            standings = v.seri;
            jQuery("#standings").html('West ' + round + ': ' + standings);
          }
        });
      });
    }
    if (data.pb.r.length === 4) {
      round = data.pb.r[3].d;

      data.pb.r[3].co.forEach(function(v) {

        v.ser.forEach(function(v) {
          if (v.tn1 === "Trail Blazers" || v.tn2 === "Trail Blazers") {
            standings = v.seri;
            jQuery("#standings").html(round + ': ' + standings);
          }
        });
      });
    }

  });

  function getGameIds() {
    return new Promise(function(resolve, reject) {
      jQuery.getJSON("https://data.nba.com/data/v2015/json/mobile_teams/nba/2017/scores/00_playoff_bracket.json", function(data) {

        var rArray = data.pb.r;

        var retArr = jQuery.map(rArray, function(v) {
          v.co.forEach(function(v) {

            v.ser.forEach(function(v) {

              if (v.tn1 === "Trail Blazers" || v.tn2 === "Trail Blazers") {

                v.g.forEach(function(v) {
                  gameIDs.push(v.gid);
                });
              }
            });
          });
        });

        /*Only show games if we have gameIDs */
        if (gameIDs && gameIDs.length) {
          //resolve(['0041700161', '0041700162', '0041700163', '0041700164']);
          resolve(gameIDs);
        } else {
          reject()
          console.log('No GameIDs found');
        }

      })

    })
  }

  function sortNumber(a, b) {
    return a.g.gid - b.g.gid;
  }

  function getGameData(id) {

    jQuery.ajaxSetup({ cache: false });

    function gameDetailURL(id) {
      return "https://data.nba.com/data/v2015/json/mobile_teams/nba/2017/scores/gamedetail/" + id + "_gamedetail.json"
    }

    // Return a promise
    return new Promise(function(resolve, reject) {
      jQuery.getJSON(gameDetailURL(id),
        function(data) {
          const status = parseInt(data.g.st)
          if (!data) {
            console.log('NO Game Detail Data for GameID' + id)
            reject()

          } else if (status === 2) {
            if (id !== activeGame) {
              console.log('setting interval')
              activeGame = id;
              activeGameInterval = setInterval(function() {
                render()
              }, 5000);
            }

          } else if (id === activeGame) {
            console.log('clearing interval')
            activeGame = undefined;
            clearInterval(activeGameInterval);
          }

          gameData.push(data)
          resolve()
        }

      )
    })
  }

  function displayGame(data) {
    var period = data.g.p;
    var gameStatus = parseInt(data.g.st);

    var gameLinks = {
      '04-14-18': 'https://www.ticketmaster.com/west-conf-qtrs-tbd-at-trail-portland-oregon-04-22-2018/event/0F00546DA600381D?brand=trailblazers&extcmp=gw510522&utm_source=NBA.com&utm_medium=client&utm_campaign=NBA_TEAM_POR&utm_content=SCHED_PG_PLAYOFFS',
      '04-17-18': 'https://www.ticketmaster.com/west-conf-qtrs-tbd-at-trail-portland-oregon-04-24-2018/event/0F00546DA6073820?brand=trailblazers&extcmp=gw510523&utm_source=NBA.com&utm_medium=client&utm_campaign=NBA_TEAM_POR&utm_content=SCHED_PG_PLAYOFFS',
      '04-24-18': 'https://www.ticketmaster.com/west-conf-qtrs-tbd-at-trail-portland-oregon-04-26-2018/event/0F00546DA60D38D9?brand=trailblazers&extcmp=gw510524&utm_source=NBA.com&utm_medium=client&utm_campaign=NBA_TEAM_POR&utm_content=SCHED_PG_PLAYOFFS',
      '04-28-18': 'https://www.ticketmaster.com/west-conf-qtrs-tbd-at-trail-portland-oregon-04-28-2018/event/0F00546DA61238DB?brand=trailblazers&extcmp=gw512485&utm_source=NBA.com&utm_medium=client&utm_campaign=NBA_TEAM_POR&utm_content=SCHED_PG_PLAYOFFS'
    }

    var gameRound = {
      '04/14': "Game 1",
      '04/17': "Game 2",
      '04/19': "Game 3",
      '04/21': "Game 4",
    }
    var round = '';
    var gameDate = moment(data.g.etm).format('MM/D');

    var pastDate = moment(data.g.gdte).format('dddd, MMM. D');

    var homeOvertime = parseInt(data.g.hls.ot1);
    var visOvertime = parseInt(data.g.vls.ot1);

    $.each(gameRound, function(key, value) {
      if (key === gameDate) {
        round = value;
      }
    });
    //Pre-Game
    if (gameStatus === 1) {
      var viewTickets;
      var gameHour = moment(data.g.etm).subtract(3, 'hours').format('h:mm A z');
      var thisLinkDate = moment(data.g.etm).format('MM-DD-YY');

      $.each(gameLinks, function(key, value) {
        key.trim();
        if (key == thisLinkDate) {
          $(".center.slider").append('<div class="home game"><div class="team-game-info"><img class="team-logo img-responsive" src="http://i.cdn.turner.com/nba/nba/.element/media/2.0/teamsites/blazers/logos/' + data.g.vls.ta + '.png" /><div class="game-details"><h3 class="text-center hour">' + pastDate + ' - ' + gameHour + 'PT</h3><h3 class="text-center round">' + round + '&nbsp; - &nbsp;' + data.g.an + '</h3></div><img class="team-logo img-responsive" src="http://i.cdn.turner.com/nba/nba/.element/media/2.0/teamsites/blazers/logos/' + data.g.hls.ta + '.png" /></div><div class="text-center"><a href="' + value + '" class="btn btn-primary btn-large" target="_blank"><strong>VIEW TICKETS</strong></a></div><h3 class="tune-in text-center"><i class="fa fa-desktop" aria-hidden="true"></i>&nbsp; NBC Sports NW &nbsp;&nbsp;<i class="fa fa-volume-up" aria-hidden="true"></i> Rip City Radio 620AM</h3></div>');
        }
      });

      if (data.g.hls.ta !== 'POR' && gameHour !== 'Invalid date') {
        $(".center.slider").append('<div class="away game"><div class="team-game-info"><img class="team-logo img-responsive" src="http://i.cdn.turner.com/nba/nba/.element/media/2.0/teamsites/blazers/logos/' + data.g.vls.ta + '.png" /><div class="game-details"><h3 class="text-center hour">' + pastDate + ' - ' + gameHour + 'PT</h3><h3 class="text-center round">' + round + '&nbsp; - &nbsp;' + data.g.an + '</h3></div><img class="team-logo img-responsive" src="http://i.cdn.turner.com/nba/nba/.element/media/2.0/teamsites/blazers/logos/' + data.g.hls.ta + '.png" /></div><h3 class="tune-in text-center"><i class="fa fa-desktop" aria-hidden="true"></i>&nbsp; NBC Sports NW &nbsp;&nbsp;<i class="fa fa-volume-up" aria-hidden="true"></i> Rip City Radio 620AM</h3></div>');
      }

    }

    //During Game
    if (gameStatus === 2) {
      //$(".active.game").remove();
      // console.log(typeof data.g.hls.q3);
      // if( data.g.hls.q1 === 0 ) {
      //   return data.g.hls.q1 === '-'
      // }
      // else {
      //   return data.g.hls.q1
      // }
      // if( data.g.hls.q2 === 0 ) {
      //  return data.g.hls.q2 === '-'
      // }
      // else {
      //   return data.g.hls.q2
      // }
      // if( data.g.hls.q3 === 0 ) {
      //   return data.g.hls.q3 === '-'
      // }
      // else {
      //   return data.g.hls.q3
      // }
      // if( data.g.hls.q4 === 0 ) {
      //   return data.g.hls.q4 === '-'
      // }
      // else {
      //   return data.g.hls.q4
      // }

      if (homeOvertime === 0 || visOvertime === 0) {
        $(".center.slider").append('<div class="active game"><div class="team-game-info"><div id="team"><img class="team-logo img-responsive" src="http://i.cdn.turner.com/nba/nba/.element/media/2.0/teamsites/blazers/logos/' + data.g.vls.ta + '.png" /><h3 class="text-center">' + data.g.vls.s + '</h3>  </div><div id="qtrscore"><div id="clock" class="text-center"><h3 style="margin-bottom:-5px;">Q' + period + ' - ' + data.g.cl + '</h3><img src="https://i.cdn.turner.com/nba/nba/.element/media/2.0/teamsites/blazers/images/bar4.gif" style="width: 68px;"></div><table class="qtrscore"><tbody><tr><th class="qtrteam"></th><th class="qtr1">1</th><th class="qtr2">2</th><th class="qtr3">3</th><th class="qtr4">4</th><th class="qtrtotal">T</th></tr><tr><td id="qtrteam1">' + data.g.vls.ta + '</td><td class="qtr1">' + data.g.vls.q1 + '</td><td class="qtr2">' + data.g.vls.q2 + '</td><td class="qtr3">' + data.g.vls.q3 + '</td><td class="qtr4">' + data.g.vls.q4 + '</td><td class="qtrtotal"><strong>' + data.g.vls.s + '</strong></td></tr><tr><td id="qtrteam2">' + data.g.hls.ta + '</td><td class="qtr1">' + data.g.hls.q1 + '</td><td class="qtr2">' + data.g.hls.q2 + '</td><td class="qtr3">' + data.g.hls.q3 + '</td><td class="qtr4">' + data.g.hls.q4 + '</td><td class="qtrtotal"><strong>' + data.g.hls.s + '</strong></td></tr></tbody></table></div><div class="team"> <img class="team-logo img-responsive" src="http://i.cdn.turner.com/nba/nba/.element/media/2.0/teamsites/blazers/logos/' + data.g.hls.ta + '.png" /><h3 class="text-center">' + data.g.hls.s + '</h3></div></div></div>');
      } else {
        $(".center.slider").append('<div class="active game"><div class="team-game-info"><div id="team"> <img class="team-logo img-responsive" src="http://i.cdn.turner.com/nba/nba/.element/media/2.0/teamsites/blazers/logos/' + data.g.vls.ta + '.png" /><h3 class="text-center">' + data.g.vls.s + '</h3></div><div id="qtrscore"><div id="clock" class="text-center"><h3 style="margin-bottom:-5px;">Q' + period + ' - ' + data.g.cl + '</h3><img src="https://i.cdn.turner.com/nba/nba/.element/media/2.0/teamsites/blazers/images/bar4.gif" style="width: 68px;"></div><table class="qtrscore"><tbody><tr><th class="qtrteam"></th><th class="qtr1">1</th><th class="qtr2">2</th><th class="qtr3">3</th><th class="qtr4">4</th><th class="ot">OT</th><th class="qtrtotal">T</th></tr><tr><td id="qtrteam1">' + data.g.vls.ta + '</td><td class="qtr1">' + data.g.vls.q1 + '</td><td class="qtr2">' + data.g.vls.q2 + '</td><td class="qtr3">' + data.g.vls.q3 + '</td><td class="qtr4">' + data.g.vls.q4 + '</td><td class="ot">' + data.g.vls.ot1 + '</td><td class="qtrtotal"><strong>' + data.g.vls.s + '</strong></td></tr><tr><td id="qtrteam2">' + data.g.hls.ta + '</td><td class="qtr1">' + data.g.hls.q1 + '</td><td class="qtr2">' + data.g.hls.q2 + '</td><td class="qtr3">' + data.g.hls.q3 + '</td><td class="qtr4">' + data.g.hls.q4 + '</td><td class="ot">' + data.g.hls.ot1 + '</td><td class="qtrtotal"><strong>' + data.g.hls.s + '</strong></td></tr></tbody></table></div><div class="team"> <img class="team-logo img-responsive" src="http://i.cdn.turner.com/nba/nba/.element/media/2.0/teamsites/blazers/logos/' + data.g.hls.ta + '.png" /><h3 class="text-center">' + data.g.hls.s + '</h3></div></div></div>')
      }
    }

    //Final
    if (gameStatus === 3) {

      var pastDate = moment(data.g.gdte).format('dddd, MMM. D');

      if (homeOvertime === 0 || visOvertime === 0) {
        $(".center.slider").append('<div class="final game"><div class="team-game-info"><div id="team"> <img class="team-logo img-responsive" src="http://i.cdn.turner.com/nba/nba/.element/media/2.0/teamsites/blazers/logos/' + data.g.vls.ta + '.png" /><h3 id="opp-total" class="text-center">' + data.g.vls.s + '</h3></div><div id="qtrscore"><div id="date" class="text-center"><h3 class="hour">' + pastDate + '</h3><h3>' + round + '</h3></div><table class="qtrscore"><tbody><tr><th class="qtrteam"></th><th class="qtr1">1</th><th class="qtr2">2</th><th class="qtr3">3</th><th class="qtr4">4</th><th class="qtrtotal">T</th></tr><tr><td id="qtrteam1">' + data.g.vls.ta + '</td><td class="qtr1">' + data.g.vls.q1 + '</td><td class="qtr2">' + data.g.vls.q2 + '</td><td class="qtr3">' + data.g.vls.q3 + '</td><td class="qtr4">' + data.g.vls.q4 + '</td><td class="qtrtotal"><strong>' + data.g.vls.s + '</strong></td></tr><tr><td id="qtrteam2">' + data.g.hls.ta + '</td><td class="qtr1">' + data.g.hls.q1 + '</td><td class="qtr2">' + data.g.hls.q2 + '</td><td class="qtr3">' + data.g.hls.q3 + '</td><td class="qtr4">' + data.g.hls.q4 + '</td><td class="qtrtotal"><strong>' + data.g.hls.s + '</strong></td></tr></tbody></table></div><div class="team"> <img class="team-logo img-responsive" src="http://i.cdn.turner.com/nba/nba/.element/media/2.0/teamsites/blazers/logos/' + data.g.hls.ta + '.png" /><h3 id="home-total" class="text-center">' + data.g.hls.s + '</h3></div></div></div>');
      } else {
        $(".center.slider").append('<div class="final game"><div class="team-game-info"><div id="team"> <img class="team-logo img-responsive" src="http://i.cdn.turner.com/nba/nba/.element/media/2.0/teamsites/blazers/logos/' + data.g.vls.ta + '.png" /><h3 id="opp-total" class="text-center">' + data.g.vls.s + '</h3></div><div id="qtrscore"><div id="date" class="text-center"><h3 class="hour">' + pastDate + '</h3><h3>' + round + '</h3></div><table class="qtrscore"><tbody><tr><th class="qtrteam"></th><th class="qtr1">1</th><th class="qtr2">2</th><th class="qtr3">3</th><th class="qtr4">4</th><th class="ot">OT</th><th class="qtrtotal">T</th></tr><tr><td id="qtrteam1">' + data.g.vls.ta + '</td><td class="qtr1">' + data.g.vls.q1 + '</td><td class="qtr2">' + data.g.vls.q2 + '</td><td class="qtr3">' + data.g.vls.q3 + '</td><td class="qtr4">' + data.g.vls.q4 + '</td><td class="ot">' + data.g.vls.ot1 + '</td><td class="qtrtotal"><strong>' + data.g.vls.s + '</strong></td></tr><tr><td id="qtrteam2">' + data.g.hls.ta + '</td><td class="qtr1">' + data.g.hls.q1 + '</td><td class="qtr2">' + data.g.hls.q2 + '</td><td class="qtr3">' + data.g.hls.q3 + '</td><td class="qtr4">' + data.g.hls.q4 + '</td><td class="ot1">' + data.g.hls.ot1 + '</td><td class="qtrtotal"><strong>' + data.g.hls.s + '</strong></td></tr></tbody></table></div><div class="team"> <img class="team-logo img-responsive" src="http://i.cdn.turner.com/nba/nba/.element/media/2.0/teamsites/blazers/logos/' + data.g.hls.ta + '.png" /><h3 id="home-total" class="text-center">' + data.g.hls.s + '</h3></div></div></div>');
      }
    }

  }

  /* EXECUTION

    1. Get gameIds
    2. For each gameId, get game data, render game
    */

  function promiseGameData(id) {
    return getGameData(id)
  }

  function render() {
    console.log('calling render')
    gameData = []
    gameIDs = []
    getGameIds().then(function(ids) {
      var proms = []
      ids.forEach(function(id) {
        console.log(id);
        proms.push(promiseGameData(id))
      })
      Promise.all(proms).then(function() {
        $(".game").remove();
        gameData.sort(sortNumber).forEach(displayGame)
      })
    })
  }

  render()


}); /* End document.ready */

//CORS RESOLUTION
// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

// Helper method to parse the title tag from the response.
function getTitle(text) {
  return text.match('<title>(.*)?</title>')[1];
}

// Make the actual CORS request.
function makeCorsRequest() {
  // This is a sample server that supports CORS.
  var url = 'http://html5rocks-cors.s3-website-us-east-1.amazonaws.com/index.html';

  var xhr = createCORSRequest('GET', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  // Response handlers.
  xhr.onload = function() {
    var text = xhr.responseText;
    var title = getTitle(text);
    alert('Response from CORS request to ' + url + ': ' + title);
  };

  xhr.onerror = function() {
    alert('Woops, there was an error making the request.');
  };

  xhr.send();
}
