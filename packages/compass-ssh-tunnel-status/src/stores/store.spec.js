import Store from './';

describe('SshTunnelStatusStore [Store]', () => {
  beforeEach(() => {
    Store.setState(Store.getInitialState());
  });

  it('defaults sshTunnel to false', () => {
    expect(Store.state.sshTunnel).to.equal(false);
  });

  it('defaults sshTunnelHostname to empty', () => {
    expect(Store.state.sshTunnelHostname).to.equal('');
  });

  it('defaults sshTunnelPort to empty', () => {
    expect(Store.state.sshTunnelPort).to.equal('');
  });

  it('defaults sshTunnelHostPortString to empty', () => {
    expect(Store.state.sshTunnelHostPortString).to.equal('');
  });

  describe('#onConnected', () => {
    context('when the host is less that 25 chars', () => {
      const dataService = {
        model: {
          sshTunnel: 'USER_PASSWORD',
          sshTunnelHostname: '123.45.67.8',
          sshTunnelOptions: { dstPort: '27019' }
        }
      };

      it('triggers with the full host and port', (done) => {
        const unsubscribe = Store.listen((state) => {
          unsubscribe();
          expect(state.sshTunnel).to.equal(true);
          expect(state.sshTunnelHostPortString).to.equal('123.45.67.8:27019');
          done();
        });
        Store.onConnected(null, dataService);
      });
    });

    context('when teh host is greater than 25 characters', () => {
      const dataService = {
        model: {
          sshTunnel: 'USER_PASSWORD',
          sshTunnelHostname: 'areallylong.amazonlikeaws.com',
          sshTunnelOptions: { dstPort: '27019' }
        }
      };

      it('triggers with the full host and port', (done) => {
        const unsubscribe = Store.listen((state) => {
          unsubscribe();
          expect(state.sshTunnel).to.equal(true);
          expect(state.sshTunnelHostPortString).to.equal('areallylo...keaws.com:27019');
          done();
        });
        Store.onConnected(null, dataService);
      });
    });
  });
});
