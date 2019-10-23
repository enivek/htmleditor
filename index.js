RTEditor = {};
RTEditor.htmlElementPosition = 0;
RTEditor.htmlElement = null;
RTEditor.mathfield = null;

function getCaretPosition() {
  if (window.getSelection && window.getSelection().getRangeAt) {
    var range = window.getSelection().getRangeAt(0);
    var selectedObj = window.getSelection();
    if( isInEditor(selectedObj.baseNode) ) {
    
        RTEditor.htmlElement = range.startContainer;
        RTEditor.htmlElementPosition = range.startOffset;
        
    }
  }
}

function isInEditor(elem) {
    if( elem.localName == 'body' ) { return false; }
    if( elem.id == 'royaltutoreditor' ) { return true; }
    return isInEditor(elem.parentNode);
}

function dialogOpen() {
    $("#latex").text('');
    $("#mathEquationId").val('');
    RTEditor.mathfield.latex('');
    $('#exampleModal').modal('show');
}

function dialogOpenForEdit(anchorTag) {
    var mathEquationElem = $(anchorTag);
    var latexEncoded = mathEquationElem.data('latex');
    var latexDecoded = decodeURI(latexEncoded);
    var mathEquationId = mathEquationElem.attr('id');
    
    RTEditor.mathfield.latex(latexDecoded);
    $("#latex").text(latexDecoded);
    $("#mathEquationId").val(mathEquationId);
    $('#exampleModal').modal('show');
}

function dialogClose() {
    
    var isNew = false;
    var mathEquationId = $("#mathEquationId").val();
    if( !mathEquationId ) {
        mathEquationId = new Date().getTime();
        isNew = true;
    } else {
        mathEquationId = parseInt(mathEquationId);
    }
    
    var latexTyped = $("#latex").text();
    var katexToHtml = katex.renderToString(latexTyped, {
        throwOnError: false,
        output: 'html'
    });
    
    var urlencodedLatex = encodeURI(latexTyped);
    
    var mathEquationElem = null;
    if( isNew ) {
    
        var elem = "<span id='" + mathEquationId + "' class='math-equation' contenteditable='false' data-latex='" + urlencodedLatex + "' onclick='dialogOpenForEdit(this);'>" + katexToHtml + "</span>&nbsp;";
        var doc = new DOMParser().parseFromString(elem, "text/xml");
        var htmlElement = doc.firstChild;
        
        focusEditor();
          
        if( RTEditor.htmlElement != null ) {

            var range = document.createRange();
            var sel = window.getSelection();
            range.setStart(RTEditor.htmlElement, RTEditor.htmlElementPosition);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            
            mathEquationElem = $(elem)[0];
            range.insertNode(mathEquationElem);  
            $("#royaltutoreditor").append($("<span>&nbsp;</span>"));  
        }
    
    } else {
    
        mathEquationElem = $("#" + mathEquationId);
        var mathElem = mathEquationElem[0];
        mathEquationElem.data('latex', urlencodedLatex);
        mathEquationElem.empty();
        mathEquationElem.html(katexToHtml);
    
    }
    
    
     var range = document.createRange();
     var sel = window.getSelection();
     var position = $("#royaltutoreditor")[0].childNodes.length;
     for( var i = 0; i < position; i++ ) {
         if( $("#royaltutoreditor")[0].childNodes[i] == mathEquationElem ) {
             position = i+1;
         }
     }
     range.setStart($("#royaltutoreditor")[0], position);
     range.collapse(true);
     sel.removeAllRanges();
     sel.addRange(range);
     
     focusEditor();
        
    $('#exampleModal').modal('hide');
    
}

function focusEditor() {
         var div = document.getElementById('royaltutoreditor');
     setTimeout(function() {
         div.focus();
     }, 0);
}

function setupToolBars() {
    
    var colorPalette = ['000000', 'FF9966', '6699FF', '99FF66', 'CC0000', '00CC00', '0000CC', '333333', '0066FF', 'FFFFFF'];
    var forePalette = $('.fore-palette');
    var backPalette = $('.back-palette');

    for (var i = 0; i < colorPalette.length; i++) {
        forePalette.append('<a href="#" data-command="forecolor" data-value="' + '#' + colorPalette[i] + '" style="background-color:' + '#' + colorPalette[i] + ';" class="palette-item"></a>');
        backPalette.append('<a href="#" data-command="backcolor" data-value="' + '#' + colorPalette[i] + '" style="background-color:' + '#' + colorPalette[i] + ';" class="palette-item"></a>');
    }

    $('.toolbar a').click(
        function(e) {
            var command = $(this).data('command');
            if (command == 'h1' || command == 'h2' || command == 'p') {
                document.execCommand('formatBlock', false, command);
            }
            if (command == 'forecolor' || command == 'backcolor') {
                document.execCommand($(this).data('command'), false, $(this).data('value'));
            }
            if (command == 'createlink' || command == 'insertimage') {
                url = prompt('Enter the link here: ', 'http:\/\/');
                document.execCommand($(this).data('command'), false, url);
            } else { 
                document.execCommand($(this).data('command'), false, null);
            }
        }
    );
    
}

document.body.onkeyup = getCaretPosition;
document.body.onmouseup = getCaretPosition;

$(document).ready(function() {

    setupToolBars();

    var mathFieldSpan = document.getElementById('math-field');
    var latexSpan = document.getElementById('latex');

    var MQ = MathQuill.getInterface(2); // for backcompat
    RTEditor.mathfield = MQ.MathField(mathFieldSpan, {
      spaceBehavesLikeTab: true, // configurable
      handlers: {
        edit: function() { // useful event handlers
          latexSpan.textContent = RTEditor.mathfield.latex(); 
        }
      }
    });

});
