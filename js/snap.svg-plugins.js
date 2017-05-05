//Text wrapping function - http://stackoverflow.com/questions/27517482/how-to-auto-text-wrap-text-in-snap-svg
Snap.plugin(function (Snap, Element, Paper, glob) {
     Paper.prototype.multitext = function (x, y, txt, max_width, attributes) {

        var svg = Snap();
        var abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var temp = svg.text(0, 0, abc);
        temp.attr(attributes);
        var letter_width = temp.getBBox().width / abc.length;
        svg.remove();

        var words = txt.split(" ");
        var width_so_far = 0, current_line=0, lines=[''];
        for (var i = 0; i < words.length; i++) {

           var l = words[i].length;
           if (width_so_far + (l * letter_width) > max_width) {
              lines.push('');
              current_line++;
              width_so_far = 0;
           }
           width_so_far += l * letter_width;
           lines[current_line] += words[i] + " ";
        }

        var t = this.text(x,y,lines).attr(attributes);
        t.selectAll("tspan:nth-child(n+2)").attr({
           dy: "1.2em",
           x: x
        });
        return t;
    };
 });
