using System;
using System.Threading.Tasks;
using CodeStream.VisualStudio.UnitTests.Stubs;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace CodeStream.VisualStudio.UnitTests.Services
{
    [TestClass]
    public class CredentialsServiceTests
    {
        [TestMethod]
        public async Task AllTestAsync()
        {
            var email = "a@b.com";
            var serverUri = new Uri("http://foo.com");
            var secret = "sEcReT";

            var testCredentialsService = new CredentialsServiceStub();

            var saved = await testCredentialsService.SaveAsync(serverUri, email, secret);
            Assert.IsTrue(saved);

            var exists = await testCredentialsService.LoadAsync(serverUri, email);
            Assert.IsTrue(exists.Item1 == email);
            Assert.IsTrue(exists.Item2 == secret);

            var deleted = await testCredentialsService.DeleteAsync(serverUri, email);
            Assert.IsTrue(deleted);
        }
    }
}
