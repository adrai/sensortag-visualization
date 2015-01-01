var React = require('react');

var ReactBootstrap = require('react-bootstrap'),
    Panel = ReactBootstrap.Panel,
    Grid = ReactBootstrap.Grid,
    Row = ReactBootstrap.Row,
    Col = ReactBootstrap.Col,
    Navbar = ReactBootstrap.Navbar,
    Nav = ReactBootstrap.Nav,
    NavItem = ReactBootstrap.NavItem,
    DropdownButton = ReactBootstrap.DropdownButton,
    MenuItem = ReactBootstrap.MenuItem;

var Home = React.createClass({
  render() {
    return (
      <div>
        <div>Home</div>
        <div>Hi @adrai</div>
        <Panel header='title of panel'>
          <Grid>
            <Row className="show-grid">
              <Col md={6}><code>&lt;{'Col md={6}'} /&gt;</code></Col>
              <Col md={6}><code>&lt;{'Col md={6}'} /&gt;</code></Col>
            </Row>

            <Row className="show-grid">
              <Col md={12}>
                <Navbar>
                  <Nav>
                    <NavItem eventKey={1} href="#">Link</NavItem>
                    <NavItem eventKey={2} href="#">Link</NavItem>
                    <DropdownButton eventKey={3} title="Dropdown">
                      <MenuItem eventKey="1">Action</MenuItem>
                      <MenuItem eventKey="2">Another action</MenuItem>
                      <MenuItem eventKey="3">Something else here</MenuItem>
                      <MenuItem divider />
                      <MenuItem eventKey="4">Separated link</MenuItem>
                    </DropdownButton>
                  </Nav>
                </Navbar>
              </Col>
            </Row>
          </Grid>
        </Panel>
      </div>
    );
  }
});

module.exports = Home;
