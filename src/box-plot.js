dc.boxPlot = function (parent, chartGroup) {
    var _chart = dc.coordinateGridChart({});

    var _whisker_iqr_factor = 1.5;
    var _whiskers_iqr = default_whiskers_iqr;
    var _whiskers = _whiskers_iqr(_whisker_iqr_factor);

    var _box = d3.box();
    var _boxWidth;

    // defaut padding to handle min/max whisker text
    _chart.yAxisPadding(12);
    // default to ordinal
    _chart.x(d3.scale.ordinal());
    _chart.xUnits(dc.units.ordinal);

    // valueAccessor should return an array of values that can be coerced into numbers
    //  or if data is overloaded for a static array of arrays, it should be `Number`
    _chart.data(function(group) {
        return group.all().map(function (d) {
            d.map = function(accessor) { return accessor.call(d,d); };
            return d;
        });
    });

    _chart.plotData = function () {
        // TODO: expose padding to as an option in coordinate-grid-chart
        _boxWidth = 0.2 * _chart.x().rangeBand();

        _box.whiskers(_whiskers)
            .width(_boxWidth)
            .height(_chart.effectiveHeight())
            .value(_chart.valueAccessor())
            .domain(_chart.y().domain());

        _chart.chartBodyG().selectAll('g.box')
            .data(_chart.data())
          .enter().append("g")
            .attr("class", "box")
            .attr("transform", function (d,i) {
                var xOffset = _chart.x()(_chart.keyAccessor()(d,i));
                xOffset += _chart.x().rangeBand()/2;
                xOffset -= _boxWidth/2;
                return "translate(" + xOffset + ",0)";
            })
            .call(_box);
    };

    _chart.yAxisMin = function () {
        var min = d3.min(_chart.data(), function (e) {
            return d3.min(_chart.valueAccessor()(e));
        });
        return dc.utils.subtract(min, _chart.yAxisPadding());
    };

    _chart.yAxisMax = function () {
        var max = d3.max(_chart.data(), function (e) {
            return d3.max(_chart.valueAccessor()(e));
        });
        return dc.utils.add(max, _chart.yAxisPadding());
    };

    // Returns a function to compute the interquartile range.
    function default_whiskers_iqr(k) {
        return function (d) {
            var q1 = d.quartiles[0],
                q3 = d.quartiles[2],
                iqr = (q3 - q1) * k,
                i = -1,
                j = d.length;
            while (d[++i] < q1 - iqr);
            while (d[--j] > q3 + iqr);
            return [i, j];
        };
    }

    return _chart.anchor(parent, chartGroup);
};
