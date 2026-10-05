function InsertMovieHallmarkCard()
{
document.write('<object CLASSID="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" width="320" height="256" CODEBASE="http://www.apple.com/qtactivex/qtplugin.cab">\n');
document.write('<param name="src" value="/museum/hallmark.mov">\n');
document.write('<param name="href" value="/museum/hallmark.mov">\n');
document.write('<param name="autoplay" value="false">\n');
document.write('<param name="loop" value="false">\n');
document.write('<param name="controller" value="true">\n');
document.write('<embed src="hallmark.mov" href="/museum/hallmark.mov" width="320" height="256" autoplay="false" loop="false" controller="true" pluginspage="http://www.apple.com/quicktime/"></embed>\n');
document.write('</object>\n');
}