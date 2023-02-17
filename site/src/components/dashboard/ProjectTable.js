import { Card, CardBody, CardTitle, CardSubtitle, Table } from "reactstrap";
import millify from "millify";

const ProjectTables = (props) => {

  const { tabledata } = props;

  let tableinfo = {};
  if (tabledata) {
    var tablevalues = tabledata

    for (let i = 0; i < (tablevalues.length < 20 ? tablevalues.length : 20); i++) {

      let element = tablevalues[i].doc;
      if (element) {
        tableinfo[i] = {
          pagename: element.reel_page_name,
          link: element.reel_link,
          views: (element.reel_play ? millify(element.reel_play) : 0),
          likes: (element.reel_like ? millify(element.reel_like) : 0 ),
          comments: (element.reel_comment ? millify(element.reel_comment) : 0 ),
        }
      }

    }

  }
  let tablevalue = Object.values(tableinfo);


  return (
    <div>
      <Card>
        <CardBody>
          <CardTitle tag="h5">Top 5 Reels</CardTitle>
          <div id="reels_table" style={{ display: "block" }}>
            <CardSubtitle className="mb-2 text-muted" tag="h6">
              Overview of the Reels
            </CardSubtitle>

            <Table className="no-wrap mt-3 align-middle" responsive borderless>
              <thead>
                <tr>
                  <th>Page Name</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {tablevalue.map((tdata, index) => (
                  <tr key={index} className="border-top">
                    <td> 
                      <h6 className="mb-0">{tdata.pagename}</h6>
                      <span className="text-muted"><a href={tdata.link} target="_blank" rel = "noopener noreferrer" style={{ color: "inherit" ,textDecoration: "inherit"}}>{tdata.link}</a></span>                    
                    </td>
                    <td>{tdata.views}</td>
                    <td>{tdata.likes}</td>
                    <td>{tdata.comments}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

          </div>
        </CardBody>
      </Card>
    </div>
  );

};

export default ProjectTables;
