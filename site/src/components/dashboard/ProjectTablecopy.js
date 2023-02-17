import { Card, CardBody, CardTitle, CardSubtitle, Table } from "reactstrap";
// import user1 from "../../assets/images/users/user1.jpg";
// import user2 from "../../assets/images/users/user2.jpg";
// import user3 from "../../assets/images/users/user3.jpg";
// import user4 from "../../assets/images/users/user4.jpg";
// import user5 from "../../assets/images/users/user5.jpg";

const ProjectTables = (props) => {

  const { tabledata } = props;
  
  tabledata.sort(function(a, b){return b.reel_view - a.reel_view});


  let tableinfo ={};
  for(let i=0; i<(tabledata.length < 6 ? tabledata.length: 5); i++){
    
    let element = tabledata[i];
    if (element){

      // console.log(element)
      tableinfo[i] = {
          // avatar: user1,
          name: element.reel_page_name,
          email: element.reel_link,
          project: element.reel_date_of_posting,
          status: "pending",
          weeks: element.reel_view,
          budget: element.reel_like,
          comments: element.reel_comment,
      }
    }

  }
  let tableData = Object.values(tableinfo);


  function reels() {

    // alert(abc);
    var element = document.getElementById("reels_table");
    if (element.style.display === "block") {
      element.style.display = "block";

    } else {
      element.style.display = "block";
    }
    element = document.getElementById("pages_table");
    if (element.style.display === "block") {
      element.style.display = "none";

    } else {
      element.style.display = "none";
    }
  }
  function pages() {

    // alert(abc);
    var element = document.getElementById("reels_table");
    if (element.style.display === "block") {
      element.style.display = "none";

    } else {
      element.style.display = "none";
    }
    element = document.getElementById("pages_table");
    if (element.style.display === "block") {
      element.style.display = "block";

    } else {
      element.style.display = "block";
    }
  }
  return (
    <div>
      <Card>
        <CardBody>
          <CardTitle tag="h5"><span style={{ cursor: "pointer" }} onClick={reels}> Reels </span> / <span style={{ cursor: "pointer" }} onClick={pages}> Pages </span></CardTitle>
          <div id="reels_table" style={{ display: "block" }}>
            <CardSubtitle className="mb-2 text-muted" tag="h6">
              Overview of the Reels
            </CardSubtitle>

            <Table className="no-wrap mt-3 align-middle" responsive borderless>
              <thead>
                <tr>
                  <th>Page Name</th>
                  <th>Date</th>

                  <th>Status</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((tdata, index) => (
                  <tr key={index} className="border-top">
                    <td>
                      {/* <div className="d-flex align-items-center p-2"> */}
                        {/* <img
                          src={tdata.avatar}
                          className="rounded-circle"
                          alt="avatar"
                          width="45"
                          height="45"
                        /> */}
                        {/* <div className="ms-3"> */}
                          <h6 className="mb-0">{tdata.name}</h6>
                          <span className="text-muted">{tdata.email}</span>
                        {/* </div> */}
                      {/* </div> */}
                    </td>
                    <td>{tdata.project}</td>
                    <td>
                      {tdata.status === "pending" ? (
                        <span className="p-2 bg-danger rounded-circle d-inline-block ms-3"></span>
                      ) : tdata.status === "holt" ? (
                        <span className="p-2 bg-warning rounded-circle d-inline-block ms-3"></span>
                      ) : (
                        <span className="p-2 bg-success rounded-circle d-inline-block ms-3"></span>
                      )}
                    </td>
                    <td>{tdata.weeks}</td>
                    <td>{tdata.budget}</td>
                    <td>{tdata.comments}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

          </div>
          <div id="pages_table" style={{ display: "none" }}>
            <CardSubtitle className="mb-2 text-muted" tag="h6">
              Overview of the Pages
            </CardSubtitle>

            <Table className="no-wrap mt-3 align-middle" responsive borderless>
              <thead>
                <tr>
                  <th>Page Name</th>
                  <th>Username</th>

                  <th>Status</th>
                  <th>Followers</th>
                  <th>Followings</th>
                  <th>Posts</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((tdata, index) => (
                  <tr key={index} className="border-top">
                    <td>
                      {/* <div className="d-flex align-items-center p-2"> */}
                        {/* <img
                          src={tdata.avatar}
                          className="rounded-circle"
                          alt="avatar"
                          width="45"
                          height="45"
                        /> */}
                        {/* <div className="ms-3"> */}
                          <h6 className="mb-0">{tdata.name}</h6>
                          <span className="text-muted">{tdata.email}</span>
                        {/* </div> */}
                      {/* </div> */}
                    </td>
                    <td>{tdata.project}</td>
                    <td>
                      {tdata.status === "pending" ? (
                        <span className="p-2 bg-danger rounded-circle d-inline-block ms-3"></span>
                      ) : tdata.status === "holt" ? (
                        <span className="p-2 bg-warning rounded-circle d-inline-block ms-3"></span>
                      ) : (
                        <span className="p-2 bg-success rounded-circle d-inline-block ms-3"></span>
                      )}
                    </td>
                    <td>{tdata.weeks}</td>
                    <td>{tdata.budget}</td>
                    <td>{tdata.budget}</td>
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
