var results;

// Filter function from MDN:
//   https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
//
if (!Array.prototype.filter)
{
    Array.prototype.filter = function(fun /*, thisp */)
    {
        "use strict";

        if (this == null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();

        var res = [];
        var thisp = arguments[1];
        for (var i = 0; i < len; i++)
        {
            if (i in t)
            {
                var val = t[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, t))
                    res.push(val);
            }
        }

        return res;
    };
}

// Create an element by name with optional text content and attributes.
//
function element(name, content, attributes) {
    var e = $(document.createElement(name));

    if (content) { e.append(content); }
    for (var a in attributes) { e.attr(a, attributes[a]); }

    return e;
}

$(function() {
    $.getJSON('ext/results.json', function(d) { results = d; });

    var context = $('#comparison');
    var clearAll = element('span', 'X',
                           {'class': 'click', title: 'Clear all'});

    clearAll.click(function() {
        $('input:checked', context).attr('checked', false).change();
    });

    $('thead tr th:first-child').before(element('th', clearAll));

    $('tbody tr', context).each(function(i, row) {
        var teamID = $(row).attr('id'),
            input = element('input', '',
                            {type: 'checkbox', id: 'input-' + teamID});

        $('td.text', row).wrapInner(function() {
            return element('label', '',
                           {for: 'input-' + teamID, onclick: ''});
        });

        input.change(function() {
            var idClass = 'team-' + teamID,
                tdClasses = {'class': 'new ' + idClass};

            if (!$(this).attr('checked')) {
                return $('.' + idClass, context).remove();
            }

            var teamName = $.trim($('td.text:first', $(this).parent()).text()),
                teamAbbr = teamName.replace(/[^A-Z]/g, ''),
                header = element('abbr', teamAbbr, {title: teamName});

            $('thead tr', context).append(element('th', header, tdClasses));

            var teamResults = results.filter(function(res) {
                return (res.homeTeam === teamID || res.awayTeam === teamID);
            });

            $.each(teamResults, function(i, result) {
                var home = (result.homeTeam === teamID),
                    opposition = (home ? result.awayTeam : result.homeTeam),
                    targetRow = $('#' + opposition, context),
                    span = $('td.' + idClass + ' span', targetRow),
                    outcome;

                if (span.length === 0) {
                    span = element('span');

                    targetRow.append(element('td', span, tdClasses));
                }

                if (result.homeScore === result.awayScore) {
                    outcome = 'draw';
                } else if (result.homeScore > result.awayScore) {
                    outcome = (home ? 'win' : 'loss');
                } else {
                    outcome = (home ? 'loss' : 'win');
                }

                span.addClass((home ? 'home' : 'away') + '-' + outcome);
            });

            // Add td in own row so that table is balanced.
            $('#' + teamID).append(element('td', '', tdClasses));
        });

        $('td:first', row).before(input);
    });
});
